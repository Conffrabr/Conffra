# Conffra — Código-fonte inicial (Next.js + Tailwind + Node API)

Este repositório contém um scaffold inicial para a plataforma **Conffra** (aluguel de espaços para eventos) com: frontend em Next.js + Tailwind, API routes para backend (Node), integração com Mercado Pago (Checkout / Split Payments), painel de anunciante e painél ADM básico. É uma base completa para você iterar.

---

## Estrutura do projeto (exemplo)

```
conffra/
├─ package.json
├─ next.config.js
├─ tailwind.config.js
├─ postcss.config.js
├─ .env.local (não comitar)
├─ public/
│  └─ logo.png
├─ pages/
│  ├─ _app.jsx
│  ├─ index.jsx
│  ├─ login.jsx
│  ├─ cadastre-se.jsx
│  ├─ anunciar.jsx
│  ├─ anuncio/[id].jsx
│  ├─ painel-anunciante.jsx
│  ├─ painel-adm.jsx
│  └─ api/
│     ├─ create_preference.js
│     ├─ webhook.js
│     └─ auth.js
├─ components/
│  ├─ Header.jsx
│  ├─ SearchBar.jsx
│  ├─ ListingCard.jsx
│  ├─ Calendar.jsx
│  └─ AdminControls.jsx
└─ styles/
   └─ globals.css
```

---

## Dependências principais (package.json)

```json
{
  "name": "conffra",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "swr": "^2.0.0",
    "axios": "^1.0.0",
    "@mercadopago/sdk-node": "^4.0.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

> Observação: versões são exemplos — ajuste conforme necessário.

---

## Arquivos-chave (exemplos)

### .env.local (exemplo — NÃO commit)

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
MERCADOPAGO_ACCESS_TOKEN_TEST=PROD_OR_TEST_ACCESS_TOKEN
MERCADOPAGO_PUBLIC_KEY=PUBLIC_KEY
SITE_COMMISSION_PERCENT=10   # 10% retidos pelo site no momento da transação
ADMIN_EMAIL=admin@conffra.local
ADMIN_PASSWORD=senhaadm123
```

---

### pages/_app.jsx

```jsx
import '../styles/globals.css'
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
```

---

### styles/globals.css (Tailwind base + cores do projeto)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root{
  --terracota: #E07A5F; /* terracota */
  --bg: #F3F4F6; /* cinza claro */
  --text: #000000;
}

body{ background: var(--bg); color: var(--text); }
```

---

### components/Header.jsx

```jsx
import Link from 'next/link'
export default function Header(){
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Conffra" className="h-10 w-10"/>
        <span className="font-bold">Conffra</span>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/">Home</Link>
        <Link href="/login" className="px-3 py-1 border rounded">Login</Link>
      </div>
    </header>
  )
}
```

---

### components/SearchBar.jsx

```jsx
export default function SearchBar(){
  return (
    <div className="bg-white p-4 rounded shadow w-full">
      <div className="flex gap-2">
        <input placeholder="Cidade, Bairro ou Tipo de Espaço" className="flex-1 p-2 border rounded" />
        <input type="date" className="p-2 border rounded" />
        <button className="px-4 py-2 rounded text-white" style={{background:'var(--terracota)'}}>Buscar</button>
      </div>
      <div className="mt-3">
        <button className="px-4 py-2 rounded font-bold" style={{background:'var(--terracota)', color:'#fff'}}>DIVULGAR MEU ESPAÇO</button>
      </div>
    </div>
  )
}
```

---

### pages/index.jsx (Home — estrutura básica)

```jsx
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import ListingCard from '../components/ListingCard'

export default function Home(){
  // exemplo estático de anúncios
  const listings = [
    {id:1,title:'Sítio para festas',city:'Campinas',price:1200,images:[]},
    {id:2,title:'Quintal com piscina',city:'Campinas',price:600,images:[]}
  ]
  return (
    <div>
      <Header />
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center my-6"><SearchBar/></div>
        <section>
          <h2 className="text-xl font-bold">Anúncios em destaque</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {listings.map(l=> <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      </main>
      <footer className="text-right p-4 text-sm">
        <a href="/painel-adm">Painel ADM</a>
      </footer>
    </div>
  )
}
```

---

### components/ListingCard.jsx

```jsx
import Link from 'next/link'
export default function ListingCard({listing}){
  return (
    <div className="bg-white rounded shadow p-3">
      <div className="h-40 bg-gray-200 rounded mb-2">IMAGEM</div>
      <h3 className="font-bold">{listing.title}</h3>
      <p className="text-sm">{listing.city}</p>
      <p className="font-semibold">R$ {listing.price} / dia</p>
      <Link href={`/anuncio/${listing.id}`} className="mt-2 inline-block text-sm">Ver anúncio</Link>
    </div>
  )
}
```

---

## API: Integração Mercado Pago (exemplo)

> Nota: a integração deve ser feita com cuidado e em ambiente de testes antes de ir para produção. Abaixo há um exemplo de `pages/api/create_preference.js` usando o SDK Node do Mercado Pago para criar uma preferência/checkout com marketplace fee ou configuração de Split Payments.

### pages/api/create_preference.js

```js
// Exemplo simplificado — adaptar para sua lógica e regras de negócio.
import mercadopago from '@mercadopago/sdk-node'

mercadopago.configurations.setAccessToken(process.env.MERCADOPAGO_ACCESS_TOKEN_TEST)

export default async function handler(req, res){
  try{
    const {listingId, startDate, endDate, totalAmount, sellerId} = req.body

    // Exemplo de uso do marketplace_fee (Checkout Pro) — cobra uma taxa do comprador.
    const preference = {
      items: [
        {
          title: `Reserva ${listingId}`,
          quantity: 1,
          unit_price: Number(totalAmount)
        }
      ],
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_API_BASE_URL}/success`,
        failure: `${process.env.NEXT_PUBLIC_API_BASE_URL}/failure`,
        pending: `${process.env.NEXT_PUBLIC_API_BASE_URL}/pending`
      },
      marketplace_fee: Math.round(Number(totalAmount) * (Number(process.env.SITE_COMMISSION_PERCENT || 10) / 100)),
      external_reference: JSON.stringify({listingId, startDate, endDate, sellerId}),
      notification_url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/webhook`
    }

    const mpResponse = await mercadopago.preferences.create(preference)
    return res.status(200).json(mpResponse)
  }catch(e){
    console.error(e)
    return res.status(500).json({error: 'Erro ao criar preferência'})
  }
}
```

**Explicação:** `marketplace_fee` é um parâmetro do Checkout Pro que informa quanto fica para o marketplace na transação (cobrado do comprador). Para um modelo mais robusto e com Split Payments (1:1 ou 1:N) utilize a API de Split Payments do Mercado Pago (é necessária configuração de aplicativos, OAuth para sellers e permissões). Esta base usa `marketplace_fee` por simplicidade, mas deixei a arquitetura preparada para migrar ao Split Payments.

---

### pages/api/webhook.js (notificações)

```js
export default async function handler(req, res){
  // tratar notifications do Mercado Pago (pagamentos, status, etc.)
  // validar signature / event, buscar preferência / external_reference
  console.log('webhook', req.body)
  // atualizar reservas / liberar contato / bloquear datas
  res.status(200).send('ok')
}
```

---

## Regras de negócio importantes implementadas (ou a implementar)

- Cadastro de usuário (locatário) com campos obrigatórios: nome, CPF, endereço, telefone, email, senha.
- Cadastro de anunciante com dados bancários: salvar IBAN/PIX para repasses (criptografar em produção).
- Cadastro de espaço com validação de todos os campos obrigatórios e upload de até 6 fotos.
- Novos anúncios entram no status `PENDENTE` (silenciado) até aprovação manual via painel ADM.
- Reserva só ocorre mediante pagamento confirmado pelo Mercado Pago. Após confirmação, marcar datas como indisponíveis.
- Mensageria interna: liberar contato do anunciante somente após confirmação do pagamento (implementar com banco de dados e flags).

---

## Painel ADM (página estática / exemplo)

Arquivo: `pages/painel-adm.jsx` — rota protegida (simplesmente por login) contendo:
- Lista de anúncios (ativar/silenciar/destacar/excluir).
- Dashboard financeiro: lista de transações, comissão retida, repasses pendentes.

(Implementação inicial pode usar um JSON estático — migrar para banco dados: PostgreSQL / MongoDB / Firebase conforme preferência.)

---

## Segurança e LGPD

- Use HTTPS (SSL/TLS) em produção.
- Não salvar senhas em texto — usar bcrypt.
- Criptografar dados sensíveis (CPF, dados bancários) em repouso.
- Adicionar política de privacidade e termos de uso.

---

## Observações sobre pagamento e repasses (como solicitado)

- O exemplo de `create_preference` usa `marketplace_fee` para cobrar uma taxa imediata do cliente (valor em reais). Isso é compatível com Checkout Pro para marketplace. Para o fluxo exato que você descreveu (10% retidos pelo site no momento do pagamento e 90% destinados ao anunciante, com liberação posterior), o ideal é usar a solução Split Payments do Mercado Pago com configuração de recebedores e OAuth. A documentação oficial do Mercado Pago descreve ambos: Checkout Pro com `marketplace_fee` e a solução Split Payments (marketplace). Consulte a documentação oficial para configuração de aplicativo, permissões e testes.

---

## Próximos passos sugeridos

1. Escolher banco de dados (Postgres recomendado) e modelar: Users, Listings, Photos, Bookings, Transactions.
2. Implementar autenticação JWT/sessions.
3. Implementar upload de imagens (S3 / Cloudinary) com limitação a 6 imagens por anúncio.
4. Implementar calendar + validação de disponibilidade robusta (bloqueios, fusos, CEPs).
5. Completar integração com Split Payments caso queira repasse automático via Mercado Pago.

---

## Observações legais e de produção

- Para usar Split Payments no Mercado Pago é necessário aprovação e configuração do marketplace (OAuth, recebedores). Teste sempre com credenciais de sandbox antes de migrar para produção.

---

## Licença

Este scaffold é um ponto de partida. Modifique, melhore e adapte ao seu workflow. Boa sorte!
