:: This method of running it isn't ideal for the long-term,
:: but it works fine for now
docker rm collabify-container
docker build -t collabify-docker:latest .
docker container run -p 8000:8080 ^
--env PIPELINE=local ^
--name collabify-container ^
collabify-docker:latest