# I M P O R T S   &   D E P E N D E N C I E S --------------------
import os
import dj_database_url
from pathlib import Path
from datetime import timedelta

# H E L P E R   F (X) N S ------------------------------------------
def get_secret(secret_id, backup=None):
    return os.getenv(secret_id, backup)

# E N V I R O N M E N T   S E T T I N G S --------------------------
is_local = get_secret('PIPELINE') != 'production'
DEBUG = is_local

# P A T H   S E T T I N G S ----------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# R O O T   &   W S G I --------------------------------------------
ROOT_URLCONF = 'myp.urls'
WSGI_APPLICATION = 'myp.wsgi.application'

# S E C U R I T Y   &   S E C R E T   K E Y ------------------------
if is_local:
    SECRET_KEY = 'django-insecure-a9(x(7r#zq)gd5co&h2n5y5%ks)=2ngwrdq%(%=%(aj#3uzr$t'
else:
    SECRET_KEY = get_secret('SECRET_KEY')
    if not SECRET_KEY:
        raise Exception("SECRET_KEY environment variable must be set in production")

ALLOWED_HOSTS = [
    'localhost', '127.0.0.1',
    '.onrender.com', 'myp-django.onrender.com'
]

# C O R S   S E T T I N G S ----------------------------------------
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = [
        "https://collabify-is5n.onrender.com",
        # etc.
    ]

# A P P S   &   M I D D L E W A R E -------------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'users',
    'feed',

    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',

    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

AUTH_USER_MODEL = 'users.CustomUser'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

if DEBUG:
    SIMPLE_JWT = {
        'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
        'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    }

# D A T A B A S E S -----------------------------------------------
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600
    )
}

# T E M P L A T E S -----------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# S T A T I C   &   M E D I A   F I L E S -------------------------
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles_build')

MEDIA_URL = '/media/'

# Media files (user uploads)
if is_local: # Development settings (DEBUG=True)
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
    STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
else:
    MEDIA_ROOT = '/var/data/media'

# I18N & T Z ------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# P K   F I E L D   T Y P E ---------------------------------------
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
