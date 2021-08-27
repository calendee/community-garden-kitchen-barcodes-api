import { Router } from "itty-router";
import { ulid } from "ulidx";
import { getBarcodeById } from "./routes/get-barcode-by-id";

// Will be used for logging eventually
const withRequestDetails = request => {
	request.details = {
		city: request.cf.city,
		country: request.cf.country,
		id: ulid().toLowerCase(),
		ip: request.headers.get("cf-connecting-ip"),
		metroCode: request.cf.metroCode,
		postalCode: request.cf.postalCode,
		region: request.cf.region,
		regionCode: request.cf.regionCode,
		timezone: request.cf.timezone,
		url: request.url,
	};
};

const withCorsHeaders = request => {
	const referer = request.headers.get("Referer");
	const url = referer ? new URL(referer) : null;

	// TODO: Improve this with a regex
	request.corsHeaders = {
		"Access-Control-Allow-Origin": ORIGINATING_DOMAINS.includes(url?.origin)
			? url?.origin
			: ORIGINATING_DOMAINS.split("||")[0],
		"Access-Control-Allow-Methods": "GET, POST",
		"Access-Control-Max-Age": "1728000",
		"Access-Control-Allow-Headers": [
			"Origin",
			"X-Requested-With",
			"content-type",
			"Accept",
		],
	};
};

const router = Router();
router
	.all("*", withRequestDetails)
	.options("*", withCorsHeaders)
	.get("*", withCorsHeaders)
	.options("*", request => {
		// TODO: Fix typings
		// @ts-ignore
		return new Response("", { headers: request.corsHeaders });
	})
	.get("/api/barcode/:id", getBarcodeById)
	.all("*", request => {
		return new Response("Not Found.", {
			status: 404,
			// TODO: Fix typings
			// @ts-ignore
			headers: request.corsHeaders,
		});
	});

const errorHandler = () => {
	return new Response("Oops! Something went wrong. Please contact support.", {
		status: 500,
	});
};

addEventListener("fetch", event =>
	// TODO: Fix typings
	// @ts-ignore
	event.respondWith(
		// TODO: Fix typings
		// @ts-ignore
		router.handle(event.request).catch(error => {
			console.log("fetch error:");
			console.log(error);
			// TODO: Fix typings
			// @ts-ignore
			return errorHandler(event, error);
		}),
	),
);
