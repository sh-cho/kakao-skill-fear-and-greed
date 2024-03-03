import { SimpleText, SkillResponse, Template } from 'kakao-chatbot-templates';

// ref: https://developers.cloudflare.com/workers/examples/protect-against-timing-attacks/
const encoder = new TextEncoder();
const isEqual = (a: string, b: string): Boolean => {
	const aBytes = encoder.encode(a);
	const bBytes = encoder.encode(b);

	if (aBytes.byteLength !== bBytes.byteLength) {
		return false;
	}

	return crypto.subtle.timingSafeEqual(aBytes, bBytes);
}


export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;

	USER_STORE: DurableObjectNamespace;

	// auth
	PRESHARED_AUTH_HEADER_KEY: string;
	PRESHARED_AUTH_HEADER_VALUE: string;
}

// req/res 형식 참고: https://kakaobusiness.gitbook.io/main/tool/chatbot/main_notions/setting_parameter#payload

export default {
	async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
		console.log("cron processed");

		// Event API 사용
		// ref: https://kakaobusiness.gitbook.io/main/tool/chatbot/main_notions/event-api#send_eventapi_policy
		// 흠..
	},

	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// 챗봇 요청은 무조건 POST로만 들어옴
		if (request.method !== "POST") {
			return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
		}

		// auth
		const PRESHARED_AUTH_HEADER_KEY = env.PRESHARED_AUTH_HEADER_KEY;
		const PRESHARED_AUTH_HEADER_VALUE = env.PRESHARED_AUTH_HEADER_VALUE;
		const psk = request.headers.get(PRESHARED_AUTH_HEADER_KEY);
		if (psk === null || isEqual(psk, PRESHARED_AUTH_HEADER_VALUE) === false) {
			return new Response("Forbidden", { status: 403 });
		}

		/***************************************************************************
		 * handlers
		 **************************************************************************/
		async function getFgi() {
			const FGI_JSON_PATH = "https://sh-cho.github.io/fear-and-greed-notifier/fgi_output.json";

			async function gatherResponse(response) {
				const { headers } = response;
				const contentType = headers.get("content-type") || "";
				if (contentType.includes("application/json")) {
					return JSON.stringify(await response.json(), null, 2);
				}
				return response.text();
			}

			const init = {
				headers: {
					"content-type": "application/json;charset=UTF-8",
				},
			};
			const response = await fetch(FGI_JSON_PATH, init);
			const requestClone = request.clone();
			const fgi = await gatherResponse(response);

			const template = new Template([
				new SimpleText(fgi)
			]);
			const skillResponseJSON = JSON.stringify(new SkillResponse(template).render());
			// console.log(skillResponseJSON);

			console.log(JSON.stringify(await requestClone.json()));
			return new Response(skillResponseJSON, init);
		}

		//
		async function setAlarm() {
			// const id = env.USER_STORE.idFromName("alarm");
			// const stub = env.USER_STORE.get(id);

			console.log(JSON.stringify(await request.json()));

			return new Response("Not Implemented", { status: 501 });
		}

		/***************************************************************************
		 * NOTE
		 * - Action type: body.action.params.type
		 * - chatId: body.userRequest.chatId
		 **************************************************************************/
		try {
			// ref: https://kakaobusiness.gitbook.io/main/tool/chatbot/main_notions/setting_parameter
			const requestClone = request.clone();
			const requestJson: any = await requestClone.json();
			const actionType: string = requestJson?.action?.params?.type || "";

			switch (actionType) {
				case "get":
					return await getFgi();

				case "set-alarm":
					return setAlarm();

				default:
					return new Response("Bad Request", { status: 400 });
			}
		} catch (e) {
			console.error("Request ID: ", (request.headers.get("X-Request-Id") || ""), ", err:", e);
			return new Response("Bad Request", { status: 400 });
		}


	},
} satisfies ExportedHandler<Env>;


// Durable Object

export class UserStore {
	state: DurableObjectState;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
	}

	async fetch(request: Request) {
		// TODO

		return new Response("", { status: 200 });
	}
}
