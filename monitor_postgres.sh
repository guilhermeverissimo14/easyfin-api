#!/bin/bash

# Configurações
DATABASE_HOST="72.60.56.3"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="easyfin-novaron"
LOG_FILE="/var/log/postgres_monitor.log"
MAX_ATTEMPTS=3

# Função para verificar se o PostgreSQL está respondendo
check_postgres() {
    pg_isready -h $DATABASE_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
    return $?
}

# Função para reiniciar PostgreSQL
restart_postgres() {
    echo "$(date): Reiniciando PostgreSQL..." >> $LOG_FILE
    sudo systemctl restart postgresql
    sleep 10
}

# Função para verificar conexões ativas
check_connections() {
    CONNECTIONS=$(psql -h $DATABASE_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';" 2>/dev/null)
    echo $CONNECTIONS
}

# Loop principal de monitoramento
while true; do
    if ! check_postgres; then
        echo "$(date): PostgreSQL não está respondendo" >> $LOG_FILE
        
        # Tentar reconectar algumas vezes
        for i in $(seq 1 $MAX_ATTEMPTS); do
            echo "$(date): Tentativa $i de $MAX_ATTEMPTS" >> $LOG_FILE
            sleep 5
            
            if check_postgres; then
                echo "$(date): PostgreSQL voltou a responder" >> $LOG_FILE
                break
            fi
            
            if [ $i -eq $MAX_ATTEMPTS ]; then
                echo "$(date): Máximo de tentativas atingido, reiniciando PostgreSQL" >> $LOG_FILE
                restart_postgres
            fi
        done
    else
        # Verificar número de conexões
        CONN_COUNT=$(check_connections)
        if [ ! -z "$CONN_COUNT" ] && [ $CONN_COUNT -gt 80 ]; then
            echo "$(date): Muitas conexões ativas ($CONN_COUNT), possível problema" >> $LOG_FILE
        fi
    fi
    
    sleep 30  # Verificar a cada 30 segundos
done