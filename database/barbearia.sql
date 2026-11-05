CREATE DATABASE IF NOT EXISTS barbearia_agenda CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE barbearia_agenda;
CREATE TABLE IF NOT EXISTS usuarios (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 nome VARCHAR(100) NOT NULL,
 email VARCHAR(150) NOT NULL UNIQUE,
 senha_hash VARCHAR(255) NOT NULL,
 nivel ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
 criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS horarios (
 id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 data DATE NOT NULL,
 hora TIME NOT NULL,
 cliente_id INT UNSIGNED NULL,
 criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_horario_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
 CONSTRAINT uk_agenda UNIQUE (data,hora),
 INDEX idx_cliente (cliente_id),
 CONSTRAINT ck_hora_cheia CHECK (MINUTE(hora)=0 AND SECOND(hora)=0 AND hora >= '00:00:00' AND hora <= '23:00:00')
) ENGINE=InnoDB;
-- Sem senhas padrão. Execute npm run criar-admin após configurar o banco.
