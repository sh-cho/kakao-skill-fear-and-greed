# kakao-skill-fear-and-greed

카카오톡 챗봇 스킬서버 for 공포 탐욕 지수([Fear & Greed Index](https://edition.cnn.com/markets/fear-and-greed))

(WIP)

- Cloudflare Workers
- Cloudflare Durable Objects

## Develop

```sh
pnpm run dev
```

Start dev server (localhost:8787)

## Deploy

```sh
pnpm run deploy
```

## etc

### Configure Secrets

Bot proxy -> Skill server 인증용 헤더

```sh
pnpm wrangler secret put PRESHARED_AUTH_HEADER_KEY
pnpm wrangler secret put PRESHARED_AUTH_HEADER_VALUE
```

(참고: https://developers.cloudflare.com/workers/configuration/secrets/)

### Log

```sh
pnpm wrangler tail
```

> [!NOTE]
> request object 로깅은 `.headers`, `.json()` 등으로 읽어서 해야 하고,
> request body는 한 번만 읽을 수 있음. 로깅등 필요하면 clone해서 사용 필요한듯

(참고: https://developers.cloudflare.com/workers/examples/logging-headers/)
