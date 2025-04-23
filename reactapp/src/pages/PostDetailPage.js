import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchPostById,
  likePost,
  deletePost,
  fetchComments,
  createComment,
  getPostImageUrl,
  getPostSongUrl,
} from "../api";
import "../styles/PostDetail.css";


const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [isCurrentUserCreator, setIsCurrentUserCreator] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // For timestamp functionality
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isTimestampMode, setIsTimestampMode] = useState(false);
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);

  // For reply functionality
  const [replyingTo, setReplyingTo] = useState(null);

  // Add this function to handle seeking
  const handleSeek = (e) => {
    if (audioRef.current) {
      // Get the coordinates of the click relative to the progress bar
      const progressBar = e.currentTarget;
      const clickPosition =
        (e.clientX - progressBar.getBoundingClientRect().left) /
        progressBar.offsetWidth;

      // Set the currentTime based on the click position percentage
      audioRef.current.currentTime = clickPosition * audioRef.current.duration;

      // If the audio was paused, resume playback
      if (audioRef.current.paused) {
        audioRef.current.play();
      }
    }
  };

  const loadPost = async () => {
    try {
      setLoading(true);
      const postData = await fetchPostById(id);
      setPost(postData);

      // Check if current user is the creator
      const currentUserId = localStorage.getItem("userId");
      setIsCurrentUserCreator(currentUserId === postData.creator.id.toString());

      // Load comments
      const commentsData = await fetchComments(id);
      setComments(commentsData);

      setError(null);
    } catch (err) {
      setError(
        "Failed to load post. It may have been deleted or you may not have permission to view it."
      );
      console.error("Error loading post:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  // Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "0:00";

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const toggleTimestampMode = () => {
    setIsTimestampMode(!isTimestampMode);
    if (!isTimestampMode) {
      // Entering timestamp mode
      setSelectedTimestamp(audioRef.current?.currentTime || 0);
    } else {
      // Exiting timestamp mode
      setSelectedTimestamp(null);
    }
  };

  const handleJumpToTimestamp = (timestamp) => {
    if (audioRef.current && timestamp !== null) {
      audioRef.current.currentTime = timestamp;
      audioRef.current.play();
    }
  };

  const handleLike = async () => {
    try {
      await likePost(id);
      loadPost(); // Refresh post data to update like count
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (confirmDelete) {
      try {
        await deletePost(id);
        navigate("/feed");
      } catch (err) {
        console.error("Error deleting post:", err);
        alert("Failed to delete post. Please try again.");
      }
    }
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId);
    setNewComment(""); // Clear any existing comment text
    setIsTimestampMode(false); // Exit timestamp mode if active
  };

  const renderCommentForm = (parentId = null) => (
    <form
      onSubmit={(e) => handleSubmitComment(e, parentId)}
      className={`comment-form ${parentId ? "reply-form" : ""}`}
    >
      {parentId && (
        <div className="replying-indicator">
          <span>Replying to comment</span>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="cancel-reply"
          >
            Cancel
          </button>
        </div>
      )}

      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder={
          parentId
            ? "Write your reply..."
            : isTimestampMode
            ? `Add your comment at ${formatTime(selectedTimestamp)}...`
            : "Add a comment..."
        }
        rows={parentId ? 2 : 3}
      />
      <button
        type="submit"
        disabled={commentLoading || !newComment.trim()}
        className="comment-button"
      >
        {commentLoading
          ? "Posting..."
          : parentId
          ? "Post Reply"
          : "Post Comment"}
      </button>
    </form>
  );

  const handleSubmitComment = async (e, parentId = null) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const commentData = {
        content: newComment,
        timestamp: isTimestampMode && !parentId ? selectedTimestamp : null,
        parent: parentId,
      };

      await createComment(id, commentData);

      // Refresh comments
      const commentsData = await fetchComments(id);
      setComments(commentsData);

      // Clear input
      setNewComment("");
      if (isTimestampMode) {
        setIsTimestampMode(false);
        setSelectedTimestamp(null);
      }
      if (parentId) {
        setReplyingTo(null);
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment. Please try again.");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="post-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-detail-error">
        <h2>Error</h2>
        <p>{error || "Post not found"}</p>
        <Link to="/feed" className="back-button">
          Back to Feed
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserTypeTag = (userType) => {
    const types = {
      1: "Producer",
      2: "Musician",
      3: "Singer",
    };

    return types[userType] || "User";
  };

  return (
    <div className="post-detail-container">
      <div className="post-detail-header">
        <Link to="/feed" className="back-link">
          ← Back to Feed
        </Link>

        {isCurrentUserCreator && (
          <div className="post-actions">
            <Link to={`/posts/${id}/edit`} className="edit-button">
              Edit
            </Link>
            <button onClick={handleDelete} className="delete-button">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="post-detail-content">
        <div className="post-creator-info">
          <div className="creator-avatar">
            {post.creator.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="creator-name">{post.creator.username}</h3>
            <span className="user-type-tag">
              {getUserTypeTag(post.creator.user_type)}
            </span>
          </div>
          <span className="post-date">{formatDate(post.created_at)}</span>
        </div>

        <h1 className="post-title">{post.title}</h1>

        {post.image && !imageError && (
          <div className="post-image">
            <img
              src={getPostImageUrl(id)}
              alt={post.title}
              onError={(e) => {
                console.error("Image failed to load");
                setImageError(true);
              }}
            />
          </div>
        )}

        {imageError && post.image && (
          <div className="media-error">
            <p>Image could not be loaded</p>
          </div>
        )}

        {post.song && !audioError && (
          <div className="post-audio">
            <audio
              controls
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onError={(e) => {
                console.error("Audio failed to load");
                setAudioError(true);
              }}
            >
              <source src={getPostSongUrl(id)} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <div className="audio-timestamps">
              <div className="current-time">{formatTime(currentTime)}</div>
              <div className="duration">{formatTime(duration)}</div>
            </div>
          </div>
        )}

        {audioError && post.song && (
          <div className="media-error">
            <p>Audio file could not be loaded</p>
          </div>
        )}

        <div className="post-metadata">
          {post.genre && <div className="post-tag">Genre: {post.genre}</div>}
          {post.looking_for && (
            <div className="post-tag">Looking for: {post.looking_for}</div>
          )}
          <div className="post-status">Status: {post.status}</div>
        </div>

        <p className="post-description">{post.description}</p>

        <div className="post-engagement">
          <button
            className={`like-button ${post.is_liked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <span className="like-icon">♥</span>
            <span>
              {post.like_count} {post.like_count === 1 ? "Like" : "Likes"}
            </span>
          </button>
        </div>
      </div>

      <div className="post-comments-section">
        <h2>Comments</h2>

        {/* Main comment form */}
        {!replyingTo && renderCommentForm()}

        {comments.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-thread">
                <div className="comment">
                  <div className="comment-header">
                    <div className="commenter-avatar">
                      {comment.author.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="commenter-info">
                      <div className="commenter-name">
                        {comment.author.username}
                        <span className="user-type-tag small">
                          {getUserTypeTag(comment.author.user_type)}
                        </span>
                      </div>
                      <span className="comment-date">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                  </div>

                  {comment.timestamp !== null && post.song && !audioError && (
                    <div
                      className="comment-timestamp"
                      onClick={() => handleJumpToTimestamp(comment.timestamp)}
                    >
                      <span className="timestamp-icon">▶</span>
                      {formatTime(comment.timestamp)}
                    </div>
                  )}

                  <p className="comment-content">{comment.content}</p>

                  <div className="comment-actions">
                    <button
                      onClick={() => handleReplyClick(comment.id)}
                      className="reply-button"
                    >
                      Reply
                    </button>
                  </div>
                </div>

                {/* Reply form */}
                {replyingTo === comment.id && renderCommentForm(comment.id)}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="comment-replies">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="reply">
                        <div className="comment-header">
                          <div className="commenter-avatar small">
                            {reply.author.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="commenter-info">
                            <div className="commenter-name">
                              {reply.author.username}
                              <span className="user-type-tag small">
                                {getUserTypeTag(reply.author.user_type)}
                              </span>
                            </div>
                            <span className="comment-date">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                        </div>

                        <p className="comment-content">{reply.content}</p>

                        <div className="comment-actions">
                          <button
                            onClick={() => handleReplyClick(comment.id)}
                            className="reply-button"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;
