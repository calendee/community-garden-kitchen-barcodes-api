import { z } from "zod";
import { json as IttyJson } from "itty-router-extras";

export async function getBarcodeById(request) {
	const Code = z
		.string()
		.min(12, { message: "Please enter a 12 or 13 digit UPC code" })
		.max(13, { message: "Please enter a 12 or 13 digit UPC code" });

	const barCode = request.params.id;
	const validationResult = Code.safeParse(barCode);

	if (validationResult.success) {
		return IttyJson(
			{
				status: "success",
				data: { barCode, info: "blah blah blah" },
			},
			{ headers: request.corsHeaders },
		);
	}

	const errors = validationResult.error.issues.reduce((accumulator, issue) => {
		return { ...accumulator, [issue.path[0]]: issue.message };
	}, {});
	return new Response(
		JSON.stringify({
			status: "failed",
			errors: errors,
		}),
		{
			headers: {
				...request.corsHeaders,
				["content-type"]: "application/json; charset=utf-8",
			},
			status: 400,
		},
	);
}
