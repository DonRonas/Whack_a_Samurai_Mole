<?php

return [
    'host'    => getenv('WAMS_DB_HOST')    ?: 'localhost',
    'porta'   => getenv('WAMS_DB_PORTA')   ?: '3306',
    'banco'   => getenv('WAMS_DB_NOME')    ?: 'whack_samurai',
    'usuario' => getenv('WAMS_DB_USUARIO') ?: 'root',
    'senha'   => getenv('WAMS_DB_SENHA')   ?: '',

    
    'dsn'     => getenv('WAMS_DB_DSN')     ?: '',
];
