

CREATE DATABASE IF NOT EXISTS whack_samurai
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE whack_samurai;

CREATE TABLE IF NOT EXISTS usuarios (
    id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome       VARCHAR(100) NOT NULL,
    nascimento DATE         NOT NULL,
    cpf        CHAR(11)     NOT NULL,
    telefone   VARCHAR(20)  NOT NULL,
    email      VARCHAR(100) NOT NULL,
    username   VARCHAR(20)  NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_usuarios_username (username),
    UNIQUE KEY uq_usuarios_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS partidas (
    id             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    usuario_id     INT UNSIGNED     NOT NULL,
    modo           VARCHAR(20)      NOT NULL,
    dificuldade    VARCHAR(20)      NOT NULL,
    tamanho        TINYINT UNSIGNED NOT NULL,
    nivel          INT UNSIGNED     NOT NULL,
    acertos        INT              NOT NULL,
    pontos         INT              NOT NULL,
    tempo_segundos INT UNSIGNED     NOT NULL,
    motivo         VARCHAR(20)      NOT NULL,
    jogada_em      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_partidas_usuario_data (usuario_id, jogada_em),
    KEY idx_partidas_ranking (usuario_id, nivel, pontos),
    CONSTRAINT fk_partidas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
