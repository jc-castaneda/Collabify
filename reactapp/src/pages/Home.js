import React from 'react';

const Home = () => {
  return (
    <div className="flex justify-center items-center bg-gradient-to-r from-purple-500 to-orange-500 h-screen text-center text-white">
      <div className="p-6 max-w-2xl">
        <h1 className="text-5xl font-extrabold mb-4">
          Welcome to Collabify
        </h1>
                {/* Add a GIF between paragraphs */}
                <img
          src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTI4M243YnE2Yzc3eGI1N2s5MDd0ZjBvcW80cGc3Y2FobXVpeXhldiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xTk9ZLg70jvMTasphu/giphy.gif"
          alt="Collaboration GIF"
          className="mx-auto my-4"
        />
        <p className="text-xl mb-8">
          The ultimate platform for musicians, producers, and audio engineers to collaborate remotely in real-time.
        </p>

        <p className="text-lg mb-8">
          Unlike traditional platforms like SoundCloud, Collabify empowers artists to create together during the music-making process, not just share finished tracks.
        </p>
        <p className="text-lg mb-8">
          Share files, give timestamped feedback, control versions, and chat in real-time. Collabify makes it easy to bring your ideas to life, no matter where you are.
        </p>
        <img
          src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTBkaDkwbmNkZXFwMWkxamU4emcyOGY1YWc5a2c5MDZzMzEydGV4cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PmFSMlpvc1ZMJu3zpP/giphy.gif"
          alt="Real-time collaboration GIF"
          className="mx-auto my-4"
        />
        {/* Start Collaborating Today Button */}
        <p className="text-5xl mb-8" >
          Start Collaborating Today
        </p>
      </div>
    </div>
  );
};

export default Home;
