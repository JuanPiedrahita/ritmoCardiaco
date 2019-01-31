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

echo "Waiting postgres"
until APP_PORT=$APP_PORT APP_HOST=$APP_HOST POSTGRES_USER=$POSTGRES_USER POSTGRES_PASSWORD=$POSTGRES_PASSWORD POSTGRES_DB=$POSTGRES_DB docker-compose exec postgresdb sh -c 'psql -U postgres -c "\c heartapp"' ; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing backup command"
    #APP_PORT=$APP_PORT APP_HOST=$APP_HOST POSTGRES_USER=$POSTGRES_USER POSTGRES_PASSWORD=$POSTGRES_PASSWORD POSTGRES_DB=$POSTGRES_DB docker-compose exec postgresdb sh -c 'pg_restore -h localhost -p 5432 -U postgres -d heart_app -v "/dbbackup/backup.backup"'
    APP_PORT=$APP_PORT APP_HOST=$APP_HOST POSTGRES_USER=$POSTGRES_USER POSTGRES_PASSWORD=$POSTGRES_PASSWORD POSTGRES_DB=$POSTGRES_DB docker-compose exec postgresdb sh -c 'psql -U heartapp -d heartapp -a -f "/dbbackup/backup.sql"'
    
echo "Deteniendo contenedores"
APP_PORT=$APP_PORT APP_HOST=$APP_HOST POSTGRES_USER=$POSTGRES_USER POSTGRES_PASSWORD=$POSTGRES_PASSWORD POSTGRES_DB=$POSTGRES_DB docker-compose down

echo "Deteniendo contenedores"
APP_PORT=$APP_PORT APP_HOST=$APP_HOST POSTGRES_USER=$POSTGRES_USER POSTGRES_PASSWORD=$POSTGRES_PASSWORD POSTGRES_DB=$POSTGRES_DB docker-compose up -d
 
echo "App running"