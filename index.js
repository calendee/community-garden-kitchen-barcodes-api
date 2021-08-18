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
	const url = new URL(referer);

	request.corsHeaders = {
		"Access-Control-Allow-Origin": ORIGINATING_DOMAINS.includes(url)
			? url.origin
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
	.options("*", request => {
		return new Response("", { headers: request.corsHeaders });
	})
	.get("/api/barcode/:id", getBarcodeById)
	.all("*", () => {
		return new Response("Not Found.", { status: 404 });
	});

const errorHandler = () => {
	return new Response("Oops! Something went wrong. Please contact support.", {
		status: 500,
	});
};

addEventListener("fetch", event =>
	event.respondWith(
		router.handle(event.request).catch(error => {
			console.log("Error!");
			console.log(error);
			return errorHandler(event, error);
		}),
	),
);
