:: This method of running it isn't ideal for the long-term,
:: but it works fine for now
docker rm collabify-container
docker build -t collabify-docker:latest .
docker container run -p 8000:8080 ^
--env PIPELINE=production ^
--env SECRET_KEY=asdf ^
--env DB_NAME=. ^
--env DB_USER_NM=. ^
--env DB_USER_PW=. ^
--env DB_IP=0.0.0.0 ^
--env DB_PORT=5432 ^
--name collabify-container ^
collabify-docker:latest