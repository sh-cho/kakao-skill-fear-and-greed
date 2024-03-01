import { SimpleText, SkillResponse, Template } from 'kakao-chatbot-templates';

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
}

// req/res 형식 참고: https://kakaobusiness.gitbook.io/main/tool/chatbot/main_notions/setting_parameter#payload

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {

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
		const fgi = await gatherResponse(response);

		const template = new Template([
			new SimpleText(fgi)
		]);
		const skillResponseJSON = JSON.stringify(new SkillResponse(template).render());

		console.log(skillResponseJSON);

		return new Response(skillResponseJSON, init);
	},
};
