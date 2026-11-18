<?php
declare(strict_types=1);

function so_digitos(string $texto): string
{
    return preg_replace('/\D+/', '', $texto) ?? '';
}


function campo_texto(array $dados, string $chave): string
{
    $valor = $dados[$chave] ?? '';
    return is_string($valor) ? trim($valor) : '';
}


function campo_senha(array $dados): string
{
    $valor = $dados['senha'] ?? '';
    return is_string($valor) ? $valor : '';
}


function comprimento_texto(string $texto): int
{
    $n = preg_match_all('/./su', $texto);
    return $n === false ? PHP_INT_MAX : $n;
}

function validar_nome(string $nome): ?string
{
    $palavras = preg_split('/\s+/u', $nome, -1, PREG_SPLIT_NO_EMPTY);
    if (!is_array($palavras) || count($palavras) < 2) {
        return 'Informe o nome completo.';
    }
    if (comprimento_texto($nome) > 100) {
        return 'O nome pode ter no máximo 100 caracteres.';
    }
    return null;
}

function validar_nascimento(string $nascimento): ?string
{
    if ($nascimento === '') {
        return 'Informe a data de nascimento.';
    }

    $data = DateTimeImmutable::createFromFormat('!Y-m-d', $nascimento);
    
    if ($data === false || $data->format('Y-m-d') !== $nascimento) {
        return 'Data de nascimento inválida.';
    }
    if ((int) $data->format('Y') < 1900 || $data > new DateTimeImmutable('today')) {
        return 'Data de nascimento inválida.';
    }
    return null;
}

function validar_cpf(string $cpf): ?string
{
    return strlen(so_digitos($cpf)) === 11 ? null : 'O CPF deve ter 11 dígitos.';
}

function validar_telefone(string $telefone): ?string
{
    $digitos = strlen(so_digitos($telefone));
    if ($digitos < 10 || $digitos > 11 || comprimento_texto($telefone) > 20) {
        return 'Telefone inválido (DDD + número).';
    }
    return null;
}

function validar_email(string $email): ?string
{
    if (comprimento_texto($email) > 100 || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        return 'E-mail inválido.';
    }
    return null;
}

function validar_username(string $username): ?string
{
    if (!preg_match('/^[A-Za-z0-9_]{3,20}$/', $username)) {
        return 'Username: de 3 a 20 caracteres (letras, números ou _).';
    }
    return null;
}


function validar_senha(string $senha, bool $opcional = false): ?string
{
    if ($opcional && $senha === '') {
        return null;
    }
    if (comprimento_texto($senha) < 4) {
        return 'A senha deve ter ao menos 4 caracteres.';
    }
    if (strlen($senha) > 72) { 
        return 'A senha é muito longa.';
    }
    return null;
}
