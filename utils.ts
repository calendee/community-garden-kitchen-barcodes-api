// Based on https://www.maxpou.fr/async-await-without-try-catch and https://github.com/JFDI-Consulting/attempt and https://blog.usegravity.app/this-simple-node-js-trick-will-save-you-100s-of-lines-of-code/

export function asyncWrapper<T>(somePromise: Promise<T>) {
	return somePromise
		.then(data => ({ error: null, data }))
		.catch(error => {
			console.log("Error", error.message);
			return { error: { message: error.message }, data: null };
		});
}

// Based on https://www.youtube.com/watch?v=aIboXjxo-w8
export async function fetchJson(
	input: RequestInfo,
	init?: RequestInit | undefined,
) {
	const { error, data: response } = await asyncWrapper(fetch(input, init));

	if (error) {
		return { data: null, error };
	}

	const contentType = response?.headers?.get("content-type");

	if (!contentType?.includes("application/json")) {
		if (response.status === 404) {
			return { data: null, error: { message: "Not Found", status: 404 } };
		}

		return { data: null, error: { message: "Server Error", status: 404 } };
	}

	const json = await response?.json();
	return { data: json, error };
}
