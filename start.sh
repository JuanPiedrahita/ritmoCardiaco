source .conf

echo "Deteniendo contenedores"
APP_PORT=$APP_PORT APP_HOST=$APP_HOST POSTGRES_USER=$POSTGRES_USER POSTGRES_PASSWORD=$POSTGRES_PASSWORD POSTGRES_DB=$POSTGRES_DB docker-compose down

if [ -f database/ ]; then
    echo "Carpeta database ya creada"
else
    mkdir database
    echo "Carpeta database creada..."
fi

echo "Levantando contenedores"
APP_PORT=$APP_PORT APP_HOST=$APP_HOST POSTGRES_USER=$POSTGRES_USER POSTGRES_PASSWORD=$POSTGRES_PASSWORD POSTGRES_DB=$POSTGRES_DB docker-compose up -d

echo "App running"