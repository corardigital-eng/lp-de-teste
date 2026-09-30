# Financeiro PF/PJ

App local (sem servidor, sem cadastro) para organizar contas pessoais e da empresa lado a lado.

## Como rodar

Abrir `index.html` direto no navegador pode falhar no carregamento do PDF (restrição de `file://`). Rode um servidor local simples:

```bash
cd financeiro
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`.

## Como usar

1. Aba **Pessoal** ou **Empresa (PJ)** → "+ nova conta/cartão" para cadastrar suas contas e cartões, com saldo atual.
2. Em cada conta: **"importar PDF"** para subir o extrato/fatura, ou **"lançar manual"** para um lançamento avulso.
3. Ao importar PDF, revise a tabela antes de confirmar — o reconhecimento é automático mas nem todo banco tem o mesmo layout, então confira valores, datas e se é despesa/receita antes de salvar.
4. Compras parceladas: preencha o campo parcela como `3/10` (parcela atual/total). O sistema projeta as parcelas futuras nos gráficos.
5. Na aba **Empresa (PJ)**: cadastre as contas a pagar (fixas ou recorrentes) para ver a provisão e a projeção de caixa dos próximos 6 meses.
6. Na aba **Visão Geral**: registre as retiradas feitas da empresa para uso pessoal (valor livre, sem periodicidade fixa).

## Dados

Tudo fica salvo no `localStorage` do navegador — nada é enviado para servidor nenhum. Use **"Exportar backup"** regularmente (gera um `.json`) e guarde em local seguro; **"Importar backup"** restaura tudo. Trocar de navegador ou limpar dados do site apaga o localStorage, então o backup é a única cópia de segurança.

## Limitações conhecidas

- O parser de PDF usa reconhecimento de padrão (data + valor por linha) que funciona na maioria dos extratos brasileiros, mas não é garantido para todo banco/layout. Sempre revise a tabela antes de confirmar a importação.
- Sem multiusuário/senha — é local, pensado para uso individual.
