# I M P O R T S   &   D E P E N D E N C I E S --------------------
import os
import dj_database_url
from pathlib import Path
from datetime import timedelta

# H E L P E R   F (X) N S ------------------------------------------
# Gets environment variables
def get_secret(secret_id, backup=None):
    return os.getenv(secret_id, backup)

# E N V I R O N M E N T   S E T T I N G S --------------------------
# Gets PIPELINE environment variable
is_local = get_secret('PIPELINE') != 'production'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = is_local

# P A T H   S E T T I N G S ----------------------------------------
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Root URL Configuration
ROOT_URLCONF = 'myp.urls'

# Web Server Gateway Interface (Default)
WSGI_APPLICATION = 'myp.wsgi.application'

# S E C U R I T Y   S E T T I N G S --------------------------------
# SECURITY WARNING: keep the secret key used in production secret!
if is_local:
    SECRET_KEY = 'django-insecure-a9(x(7r#zq)gd5co&h2n5y5%ks)=2ngwrdq%(%=%(aj#3uzr$t'
else:
    SECRET_KEY = get_secret('SECRET_KEY')
    if not SECRET_KEY:
        raise Exception("SECRET_KEY environment variable must be set in production")

# Defines which domains can serve requests from this Django instance
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.onrender.com', 'myp-django.onrender.com']

# C O R S   S E T T I N G S ----------------------------------------
# CORS Configuration - controls which domains can access API
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = [
        "https://collabify-is5n.onrender.com"
        # Add any other production frontend URLs here
    ]

# A P P L I C A T I O N S   &   M I D D L E W A R E ----------------
# Application definition
INSTALLED_APPS = [
    # Django Built-in Apps (Default)---
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Custom Apps -------------------
    'users',  # Our user management APP
    'feed',   # Our post management APP

    # Rest framework and JWT
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',

    # CORS support
    'corsheaders'
]

# Middleware definition
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at the top!
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# A U T H E N T I C A T I O N   S E T T I N G S -------------------
# Telling Django to use our custom model
AUTH_USER_MODEL = 'users.CustomUser'

# Telling Django to use JWT for authentication
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# Password Validators (Default)
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

if DEBUG:
    # Longer Token Expiration Time for Testint and Developement
    SIMPLE_JWT = {
        'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
        'REFRESH_TOKEN_LIFETIME': timedelta(days=7)
    }

# D A T A B A S E   S E T T I N G S -------------------------------
# Database URL handling (Default)
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600
    )
}

# T E M P L A T E S   S E T T I N G S -----------------------------
# (Default)
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

# S T A T I C   F I L E S   S E T T I N G S -----------------------
# Static files settings
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# I N T E R N A T I O N A L I Z A T I O N -------------------------
# Internationalization (Default)
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
