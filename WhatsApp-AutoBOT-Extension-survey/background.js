/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const resolveFetch$3 = (customFetch) => {
    if (customFetch) {
        return (...args) => customFetch(...args);
    }
    return (...args) => fetch(...args);
};

/**
 * Base error for Supabase Edge Function invocations.
 *
 * @example
 * ```ts
 * import { FunctionsError } from '@supabase/functions-js'
 *
 * throw new FunctionsError('Unexpected error invoking function', 'FunctionsError', {
 *   requestId: 'abc123',
 * })
 * ```
 */
class FunctionsError extends Error {
    constructor(message, name = 'FunctionsError', context) {
        super(message);
        this.name = name;
        this.context = context;
    }
}
/**
 * Error thrown when the network request to an Edge Function fails.
 *
 * @example
 * ```ts
 * import { FunctionsFetchError } from '@supabase/functions-js'
 *
 * throw new FunctionsFetchError({ requestId: 'abc123' })
 * ```
 */
class FunctionsFetchError extends FunctionsError {
    constructor(context) {
        super('Failed to send a request to the Edge Function', 'FunctionsFetchError', context);
    }
}
/**
 * Error thrown when the Supabase relay cannot reach the Edge Function.
 *
 * @example
 * ```ts
 * import { FunctionsRelayError } from '@supabase/functions-js'
 *
 * throw new FunctionsRelayError({ region: 'us-east-1' })
 * ```
 */
class FunctionsRelayError extends FunctionsError {
    constructor(context) {
        super('Relay Error invoking the Edge Function', 'FunctionsRelayError', context);
    }
}
/**
 * Error thrown when the Edge Function returns a non-2xx status code.
 *
 * @example
 * ```ts
 * import { FunctionsHttpError } from '@supabase/functions-js'
 *
 * throw new FunctionsHttpError({ status: 500 })
 * ```
 */
class FunctionsHttpError extends FunctionsError {
    constructor(context) {
        super('Edge Function returned a non-2xx status code', 'FunctionsHttpError', context);
    }
}
// Define the enum for the 'region' property
var FunctionRegion;
(function (FunctionRegion) {
    FunctionRegion["Any"] = "any";
    FunctionRegion["ApNortheast1"] = "ap-northeast-1";
    FunctionRegion["ApNortheast2"] = "ap-northeast-2";
    FunctionRegion["ApSouth1"] = "ap-south-1";
    FunctionRegion["ApSoutheast1"] = "ap-southeast-1";
    FunctionRegion["ApSoutheast2"] = "ap-southeast-2";
    FunctionRegion["CaCentral1"] = "ca-central-1";
    FunctionRegion["EuCentral1"] = "eu-central-1";
    FunctionRegion["EuWest1"] = "eu-west-1";
    FunctionRegion["EuWest2"] = "eu-west-2";
    FunctionRegion["EuWest3"] = "eu-west-3";
    FunctionRegion["SaEast1"] = "sa-east-1";
    FunctionRegion["UsEast1"] = "us-east-1";
    FunctionRegion["UsWest1"] = "us-west-1";
    FunctionRegion["UsWest2"] = "us-west-2";
})(FunctionRegion || (FunctionRegion = {}));

/**
 * Client for invoking Supabase Edge Functions.
 */
class FunctionsClient {
    /**
     * Creates a new Functions client bound to an Edge Functions URL.
     *
     * @example
     * ```ts
     * import { FunctionsClient, FunctionRegion } from '@supabase/functions-js'
     *
     * const functions = new FunctionsClient('https://xyzcompany.supabase.co/functions/v1', {
     *   headers: { apikey: 'public-anon-key' },
     *   region: FunctionRegion.UsEast1,
     * })
     * ```
     */
    constructor(url, { headers = {}, customFetch, region = FunctionRegion.Any, } = {}) {
        this.url = url;
        this.headers = headers;
        this.region = region;
        this.fetch = resolveFetch$3(customFetch);
    }
    /**
     * Updates the authorization header
     * @param token - the new jwt token sent in the authorisation header
     * @example
     * ```ts
     * functions.setAuth(session.access_token)
     * ```
     */
    setAuth(token) {
        this.headers.Authorization = `Bearer ${token}`;
    }
    /**
     * Invokes a function
     * @param functionName - The name of the Function to invoke.
     * @param options - Options for invoking the Function.
     * @example
     * ```ts
     * const { data, error } = await functions.invoke('hello-world', {
     *   body: { name: 'Ada' },
     * })
     * ```
     */
    invoke(functionName_1) {
        return __awaiter(this, arguments, void 0, function* (functionName, options = {}) {
            var _a;
            let timeoutId;
            let timeoutController;
            try {
                const { headers, method, body: functionArgs, signal, timeout } = options;
                let _headers = {};
                let { region } = options;
                if (!region) {
                    region = this.region;
                }
                // Add region as query parameter using URL API
                const url = new URL(`${this.url}/${functionName}`);
                if (region && region !== 'any') {
                    _headers['x-region'] = region;
                    url.searchParams.set('forceFunctionRegion', region);
                }
                let body;
                if (functionArgs &&
                    ((headers && !Object.prototype.hasOwnProperty.call(headers, 'Content-Type')) || !headers)) {
                    if ((typeof Blob !== 'undefined' && functionArgs instanceof Blob) ||
                        functionArgs instanceof ArrayBuffer) {
                        // will work for File as File inherits Blob
                        // also works for ArrayBuffer as it is the same underlying structure as a Blob
                        _headers['Content-Type'] = 'application/octet-stream';
                        body = functionArgs;
                    }
                    else if (typeof functionArgs === 'string') {
                        // plain string
                        _headers['Content-Type'] = 'text/plain';
                        body = functionArgs;
                    }
                    else if (typeof FormData !== 'undefined' && functionArgs instanceof FormData) {
                        // don't set content-type headers
                        // Request will automatically add the right boundary value
                        body = functionArgs;
                    }
                    else {
                        // default, assume this is JSON
                        _headers['Content-Type'] = 'application/json';
                        body = JSON.stringify(functionArgs);
                    }
                }
                else {
                    if (functionArgs &&
                        typeof functionArgs !== 'string' &&
                        !(typeof Blob !== 'undefined' && functionArgs instanceof Blob) &&
                        !(functionArgs instanceof ArrayBuffer) &&
                        !(typeof FormData !== 'undefined' && functionArgs instanceof FormData)) {
                        body = JSON.stringify(functionArgs);
                    }
                    else {
                        body = functionArgs;
                    }
                }
                // Handle timeout by creating an AbortController
                let effectiveSignal = signal;
                if (timeout) {
                    timeoutController = new AbortController();
                    timeoutId = setTimeout(() => timeoutController.abort(), timeout);
                    // If user provided their own signal, we need to respect both
                    if (signal) {
                        effectiveSignal = timeoutController.signal;
                        // If the user's signal is aborted, abort our timeout controller too
                        signal.addEventListener('abort', () => timeoutController.abort());
                    }
                    else {
                        effectiveSignal = timeoutController.signal;
                    }
                }
                const response = yield this.fetch(url.toString(), {
                    method: method || 'POST',
                    // headers priority is (high to low):
                    // 1. invoke-level headers
                    // 2. client-level headers
                    // 3. default Content-Type header
                    headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
                    body,
                    signal: effectiveSignal,
                }).catch((fetchError) => {
                    throw new FunctionsFetchError(fetchError);
                });
                const isRelayError = response.headers.get('x-relay-error');
                if (isRelayError && isRelayError === 'true') {
                    throw new FunctionsRelayError(response);
                }
                if (!response.ok) {
                    throw new FunctionsHttpError(response);
                }
                let responseType = ((_a = response.headers.get('Content-Type')) !== null && _a !== void 0 ? _a : 'text/plain').split(';')[0].trim();
                let data;
                if (responseType === 'application/json') {
                    data = yield response.json();
                }
                else if (responseType === 'application/octet-stream' ||
                    responseType === 'application/pdf') {
                    data = yield response.blob();
                }
                else if (responseType === 'text/event-stream') {
                    data = response;
                }
                else if (responseType === 'multipart/form-data') {
                    data = yield response.formData();
                }
                else {
                    // default to text
                    data = yield response.text();
                }
                return { data, error: null, response };
            }
            catch (error) {
                return {
                    data: null,
                    error,
                    response: error instanceof FunctionsHttpError || error instanceof FunctionsRelayError
                        ? error.context
                        : undefined,
                };
            }
            finally {
                // Clear the timeout if it was set
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            }
        });
    }
}

//#region src/PostgrestError.ts
/**
* Error format
*
* {@link https://postgrest.org/en/stable/api.html?highlight=options#errors-and-http-status-codes}
*/
var PostgrestError = class extends Error {
	/**
	* @example
	* ```ts
	* import PostgrestError from '@supabase/postgrest-js'
	*
	* throw new PostgrestError({
	*   message: 'Row level security prevented the request',
	*   details: 'RLS denied the insert',
	*   hint: 'Check your policies',
	*   code: 'PGRST301',
	* })
	* ```
	*/
	constructor(context) {
		super(context.message);
		this.name = "PostgrestError";
		this.details = context.details;
		this.hint = context.hint;
		this.code = context.code;
	}
};

//#endregion
//#region src/PostgrestBuilder.ts
var PostgrestBuilder = class {
	/**
	* Creates a builder configured for a specific PostgREST request.
	*
	* @example
	* ```ts
	* import PostgrestQueryBuilder from '@supabase/postgrest-js'
	*
	* const builder = new PostgrestQueryBuilder(
	*   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
	*   { headers: new Headers({ apikey: 'public-anon-key' }) }
	* )
	* ```
	*/
	constructor(builder) {
		var _builder$shouldThrowO, _builder$isMaybeSingl;
		this.shouldThrowOnError = false;
		this.method = builder.method;
		this.url = builder.url;
		this.headers = new Headers(builder.headers);
		this.schema = builder.schema;
		this.body = builder.body;
		this.shouldThrowOnError = (_builder$shouldThrowO = builder.shouldThrowOnError) !== null && _builder$shouldThrowO !== void 0 ? _builder$shouldThrowO : false;
		this.signal = builder.signal;
		this.isMaybeSingle = (_builder$isMaybeSingl = builder.isMaybeSingle) !== null && _builder$isMaybeSingl !== void 0 ? _builder$isMaybeSingl : false;
		if (builder.fetch) this.fetch = builder.fetch;
		else this.fetch = fetch;
	}
	/**
	* If there's an error with the query, throwOnError will reject the promise by
	* throwing the error instead of returning it as part of a successful response.
	*
	* {@link https://github.com/supabase/supabase-js/issues/92}
	*/
	throwOnError() {
		this.shouldThrowOnError = true;
		return this;
	}
	/**
	* Set an HTTP header for the request.
	*/
	setHeader(name, value) {
		this.headers = new Headers(this.headers);
		this.headers.set(name, value);
		return this;
	}
	then(onfulfilled, onrejected) {
		var _this = this;
		if (this.schema === void 0) ; else if (["GET", "HEAD"].includes(this.method)) this.headers.set("Accept-Profile", this.schema);
		else this.headers.set("Content-Profile", this.schema);
		if (this.method !== "GET" && this.method !== "HEAD") this.headers.set("Content-Type", "application/json");
		const _fetch = this.fetch;
		let res = _fetch(this.url.toString(), {
			method: this.method,
			headers: this.headers,
			body: JSON.stringify(this.body),
			signal: this.signal
		}).then(async (res$1) => {
			let error = null;
			let data = null;
			let count = null;
			let status = res$1.status;
			let statusText = res$1.statusText;
			if (res$1.ok) {
				var _this$headers$get2, _res$headers$get;
				if (_this.method !== "HEAD") {
					var _this$headers$get;
					const body = await res$1.text();
					if (body === "") ; else if (_this.headers.get("Accept") === "text/csv") data = body;
					else if (_this.headers.get("Accept") && ((_this$headers$get = _this.headers.get("Accept")) === null || _this$headers$get === void 0 ? void 0 : _this$headers$get.includes("application/vnd.pgrst.plan+text"))) data = body;
					else data = JSON.parse(body);
				}
				const countHeader = (_this$headers$get2 = _this.headers.get("Prefer")) === null || _this$headers$get2 === void 0 ? void 0 : _this$headers$get2.match(/count=(exact|planned|estimated)/);
				const contentRange = (_res$headers$get = res$1.headers.get("content-range")) === null || _res$headers$get === void 0 ? void 0 : _res$headers$get.split("/");
				if (countHeader && contentRange && contentRange.length > 1) count = parseInt(contentRange[1]);
				if (_this.isMaybeSingle && _this.method === "GET" && Array.isArray(data)) if (data.length > 1) {
					error = {
						code: "PGRST116",
						details: `Results contain ${data.length} rows, application/vnd.pgrst.object+json requires 1 row`,
						hint: null,
						message: "JSON object requested, multiple (or no) rows returned"
					};
					data = null;
					count = null;
					status = 406;
					statusText = "Not Acceptable";
				} else if (data.length === 1) data = data[0];
				else data = null;
			} else {
				var _error$details;
				const body = await res$1.text();
				try {
					error = JSON.parse(body);
					if (Array.isArray(error) && res$1.status === 404) {
						data = [];
						error = null;
						status = 200;
						statusText = "OK";
					}
				} catch (_unused) {
					if (res$1.status === 404 && body === "") {
						status = 204;
						statusText = "No Content";
					} else error = { message: body };
				}
				if (error && _this.isMaybeSingle && (error === null || error === void 0 || (_error$details = error.details) === null || _error$details === void 0 ? void 0 : _error$details.includes("0 rows"))) {
					error = null;
					status = 200;
					statusText = "OK";
				}
				if (error && _this.shouldThrowOnError) throw new PostgrestError(error);
			}
			return {
				error,
				data,
				count,
				status,
				statusText
			};
		});
		if (!this.shouldThrowOnError) res = res.catch((fetchError) => {
			var _fetchError$name2;
			let errorDetails = "";
			const cause = fetchError === null || fetchError === void 0 ? void 0 : fetchError.cause;
			if (cause) {
				var _cause$message, _cause$code, _fetchError$name, _cause$name;
				const causeMessage = (_cause$message = cause === null || cause === void 0 ? void 0 : cause.message) !== null && _cause$message !== void 0 ? _cause$message : "";
				const causeCode = (_cause$code = cause === null || cause === void 0 ? void 0 : cause.code) !== null && _cause$code !== void 0 ? _cause$code : "";
				errorDetails = `${(_fetchError$name = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _fetchError$name !== void 0 ? _fetchError$name : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`;
				errorDetails += `\n\nCaused by: ${(_cause$name = cause === null || cause === void 0 ? void 0 : cause.name) !== null && _cause$name !== void 0 ? _cause$name : "Error"}: ${causeMessage}`;
				if (causeCode) errorDetails += ` (${causeCode})`;
				if (cause === null || cause === void 0 ? void 0 : cause.stack) errorDetails += `\n${cause.stack}`;
			} else {
				var _fetchError$stack;
				errorDetails = (_fetchError$stack = fetchError === null || fetchError === void 0 ? void 0 : fetchError.stack) !== null && _fetchError$stack !== void 0 ? _fetchError$stack : "";
			}
			return {
				error: {
					message: `${(_fetchError$name2 = fetchError === null || fetchError === void 0 ? void 0 : fetchError.name) !== null && _fetchError$name2 !== void 0 ? _fetchError$name2 : "FetchError"}: ${fetchError === null || fetchError === void 0 ? void 0 : fetchError.message}`,
					details: errorDetails,
					hint: "",
					code: ""
				},
				data: null,
				count: null,
				status: 0,
				statusText: ""
			};
		});
		return res.then(onfulfilled, onrejected);
	}
	/**
	* Override the type of the returned `data`.
	*
	* @typeParam NewResult - The new result type to override with
	* @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
	*/
	returns() {
		/* istanbul ignore next */
		return this;
	}
	/**
	* Override the type of the returned `data` field in the response.
	*
	* @typeParam NewResult - The new type to cast the response data to
	* @typeParam Options - Optional type configuration (defaults to { merge: true })
	* @typeParam Options.merge - When true, merges the new type with existing return type. When false, replaces the existing types entirely (defaults to true)
	* @example
	* ```typescript
	* // Merge with existing types (default behavior)
	* const query = supabase
	*   .from('users')
	*   .select()
	*   .overrideTypes<{ custom_field: string }>()
	*
	* // Replace existing types completely
	* const replaceQuery = supabase
	*   .from('users')
	*   .select()
	*   .overrideTypes<{ id: number; name: string }, { merge: false }>()
	* ```
	* @returns A PostgrestBuilder instance with the new type
	*/
	overrideTypes() {
		return this;
	}
};

//#endregion
//#region src/PostgrestTransformBuilder.ts
var PostgrestTransformBuilder = class extends PostgrestBuilder {
	/**
	* Perform a SELECT on the query result.
	*
	* By default, `.insert()`, `.update()`, `.upsert()`, and `.delete()` do not
	* return modified rows. By calling this method, modified rows are returned in
	* `data`.
	*
	* @param columns - The columns to retrieve, separated by commas
	*/
	select(columns) {
		let quoted = false;
		const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
			if (/\s/.test(c) && !quoted) return "";
			if (c === "\"") quoted = !quoted;
			return c;
		}).join("");
		this.url.searchParams.set("select", cleanedColumns);
		this.headers.append("Prefer", "return=representation");
		return this;
	}
	/**
	* Order the query result by `column`.
	*
	* You can call this method multiple times to order by multiple columns.
	*
	* You can order referenced tables, but it only affects the ordering of the
	* parent table if you use `!inner` in the query.
	*
	* @param column - The column to order by
	* @param options - Named parameters
	* @param options.ascending - If `true`, the result will be in ascending order
	* @param options.nullsFirst - If `true`, `null`s appear first. If `false`,
	* `null`s appear last.
	* @param options.referencedTable - Set this to order a referenced table by
	* its columns
	* @param options.foreignTable - Deprecated, use `options.referencedTable`
	* instead
	*/
	order(column, { ascending = true, nullsFirst, foreignTable, referencedTable = foreignTable } = {}) {
		const key = referencedTable ? `${referencedTable}.order` : "order";
		const existingOrder = this.url.searchParams.get(key);
		this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ""}${column}.${ascending ? "asc" : "desc"}${nullsFirst === void 0 ? "" : nullsFirst ? ".nullsfirst" : ".nullslast"}`);
		return this;
	}
	/**
	* Limit the query result by `count`.
	*
	* @param count - The maximum number of rows to return
	* @param options - Named parameters
	* @param options.referencedTable - Set this to limit rows of referenced
	* tables instead of the parent table
	* @param options.foreignTable - Deprecated, use `options.referencedTable`
	* instead
	*/
	limit(count, { foreignTable, referencedTable = foreignTable } = {}) {
		const key = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
		this.url.searchParams.set(key, `${count}`);
		return this;
	}
	/**
	* Limit the query result by starting at an offset `from` and ending at the offset `to`.
	* Only records within this range are returned.
	* This respects the query order and if there is no order clause the range could behave unexpectedly.
	* The `from` and `to` values are 0-based and inclusive: `range(1, 3)` will include the second, third
	* and fourth rows of the query.
	*
	* @param from - The starting index from which to limit the result
	* @param to - The last index to which to limit the result
	* @param options - Named parameters
	* @param options.referencedTable - Set this to limit rows of referenced
	* tables instead of the parent table
	* @param options.foreignTable - Deprecated, use `options.referencedTable`
	* instead
	*/
	range(from, to, { foreignTable, referencedTable = foreignTable } = {}) {
		const keyOffset = typeof referencedTable === "undefined" ? "offset" : `${referencedTable}.offset`;
		const keyLimit = typeof referencedTable === "undefined" ? "limit" : `${referencedTable}.limit`;
		this.url.searchParams.set(keyOffset, `${from}`);
		this.url.searchParams.set(keyLimit, `${to - from + 1}`);
		return this;
	}
	/**
	* Set the AbortSignal for the fetch request.
	*
	* @param signal - The AbortSignal to use for the fetch request
	*/
	abortSignal(signal) {
		this.signal = signal;
		return this;
	}
	/**
	* Return `data` as a single object instead of an array of objects.
	*
	* Query result must be one row (e.g. using `.limit(1)`), otherwise this
	* returns an error.
	*/
	single() {
		this.headers.set("Accept", "application/vnd.pgrst.object+json");
		return this;
	}
	/**
	* Return `data` as a single object instead of an array of objects.
	*
	* Query result must be zero or one row (e.g. using `.limit(1)`), otherwise
	* this returns an error.
	*/
	maybeSingle() {
		if (this.method === "GET") this.headers.set("Accept", "application/json");
		else this.headers.set("Accept", "application/vnd.pgrst.object+json");
		this.isMaybeSingle = true;
		return this;
	}
	/**
	* Return `data` as a string in CSV format.
	*/
	csv() {
		this.headers.set("Accept", "text/csv");
		return this;
	}
	/**
	* Return `data` as an object in [GeoJSON](https://geojson.org) format.
	*/
	geojson() {
		this.headers.set("Accept", "application/geo+json");
		return this;
	}
	/**
	* Return `data` as the EXPLAIN plan for the query.
	*
	* You need to enable the
	* [db_plan_enabled](https://supabase.com/docs/guides/database/debugging-performance#enabling-explain)
	* setting before using this method.
	*
	* @param options - Named parameters
	*
	* @param options.analyze - If `true`, the query will be executed and the
	* actual run time will be returned
	*
	* @param options.verbose - If `true`, the query identifier will be returned
	* and `data` will include the output columns of the query
	*
	* @param options.settings - If `true`, include information on configuration
	* parameters that affect query planning
	*
	* @param options.buffers - If `true`, include information on buffer usage
	*
	* @param options.wal - If `true`, include information on WAL record generation
	*
	* @param options.format - The format of the output, can be `"text"` (default)
	* or `"json"`
	*/
	explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = "text" } = {}) {
		var _this$headers$get;
		const options = [
			analyze ? "analyze" : null,
			verbose ? "verbose" : null,
			settings ? "settings" : null,
			buffers ? "buffers" : null,
			wal ? "wal" : null
		].filter(Boolean).join("|");
		const forMediatype = (_this$headers$get = this.headers.get("Accept")) !== null && _this$headers$get !== void 0 ? _this$headers$get : "application/json";
		this.headers.set("Accept", `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`);
		if (format === "json") return this;
		else return this;
	}
	/**
	* Rollback the query.
	*
	* `data` will still be returned, but the query is not committed.
	*/
	rollback() {
		this.headers.append("Prefer", "tx=rollback");
		return this;
	}
	/**
	* Override the type of the returned `data`.
	*
	* @typeParam NewResult - The new result type to override with
	* @deprecated Use overrideTypes<yourType, { merge: false }>() method at the end of your call chain instead
	*/
	returns() {
		return this;
	}
	/**
	* Set the maximum number of rows that can be affected by the query.
	* Only available in PostgREST v13+ and only works with PATCH and DELETE methods.
	*
	* @param value - The maximum number of rows that can be affected
	*/
	maxAffected(value) {
		this.headers.append("Prefer", "handling=strict");
		this.headers.append("Prefer", `max-affected=${value}`);
		return this;
	}
};

//#endregion
//#region src/PostgrestFilterBuilder.ts
const PostgrestReservedCharsRegexp = /* @__PURE__ */ new RegExp("[,()]");
var PostgrestFilterBuilder = class extends PostgrestTransformBuilder {
	/**
	* Match only rows where `column` is equal to `value`.
	*
	* To check if the value of `column` is NULL, you should use `.is()` instead.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/
	eq(column, value) {
		this.url.searchParams.append(column, `eq.${value}`);
		return this;
	}
	/**
	* Match only rows where `column` is not equal to `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/
	neq(column, value) {
		this.url.searchParams.append(column, `neq.${value}`);
		return this;
	}
	/**
	* Match only rows where `column` is greater than `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/
	gt(column, value) {
		this.url.searchParams.append(column, `gt.${value}`);
		return this;
	}
	/**
	* Match only rows where `column` is greater than or equal to `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/
	gte(column, value) {
		this.url.searchParams.append(column, `gte.${value}`);
		return this;
	}
	/**
	* Match only rows where `column` is less than `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/
	lt(column, value) {
		this.url.searchParams.append(column, `lt.${value}`);
		return this;
	}
	/**
	* Match only rows where `column` is less than or equal to `value`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/
	lte(column, value) {
		this.url.searchParams.append(column, `lte.${value}`);
		return this;
	}
	/**
	* Match only rows where `column` matches `pattern` case-sensitively.
	*
	* @param column - The column to filter on
	* @param pattern - The pattern to match with
	*/
	like(column, pattern) {
		this.url.searchParams.append(column, `like.${pattern}`);
		return this;
	}
	/**
	* Match only rows where `column` matches all of `patterns` case-sensitively.
	*
	* @param column - The column to filter on
	* @param patterns - The patterns to match with
	*/
	likeAllOf(column, patterns) {
		this.url.searchParams.append(column, `like(all).{${patterns.join(",")}}`);
		return this;
	}
	/**
	* Match only rows where `column` matches any of `patterns` case-sensitively.
	*
	* @param column - The column to filter on
	* @param patterns - The patterns to match with
	*/
	likeAnyOf(column, patterns) {
		this.url.searchParams.append(column, `like(any).{${patterns.join(",")}}`);
		return this;
	}
	/**
	* Match only rows where `column` matches `pattern` case-insensitively.
	*
	* @param column - The column to filter on
	* @param pattern - The pattern to match with
	*/
	ilike(column, pattern) {
		this.url.searchParams.append(column, `ilike.${pattern}`);
		return this;
	}
	/**
	* Match only rows where `column` matches all of `patterns` case-insensitively.
	*
	* @param column - The column to filter on
	* @param patterns - The patterns to match with
	*/
	ilikeAllOf(column, patterns) {
		this.url.searchParams.append(column, `ilike(all).{${patterns.join(",")}}`);
		return this;
	}
	/**
	* Match only rows where `column` matches any of `patterns` case-insensitively.
	*
	* @param column - The column to filter on
	* @param patterns - The patterns to match with
	*/
	ilikeAnyOf(column, patterns) {
		this.url.searchParams.append(column, `ilike(any).{${patterns.join(",")}}`);
		return this;
	}
	/**
	* Match only rows where `column` matches the PostgreSQL regex `pattern`
	* case-sensitively (using the `~` operator).
	*
	* @param column - The column to filter on
	* @param pattern - The PostgreSQL regular expression pattern to match with
	*/
	regexMatch(column, pattern) {
		this.url.searchParams.append(column, `match.${pattern}`);
		return this;
	}
	/**
	* Match only rows where `column` matches the PostgreSQL regex `pattern`
	* case-insensitively (using the `~*` operator).
	*
	* @param column - The column to filter on
	* @param pattern - The PostgreSQL regular expression pattern to match with
	*/
	regexIMatch(column, pattern) {
		this.url.searchParams.append(column, `imatch.${pattern}`);
		return this;
	}
	/**
	* Match only rows where `column` IS `value`.
	*
	* For non-boolean columns, this is only relevant for checking if the value of
	* `column` is NULL by setting `value` to `null`.
	*
	* For boolean columns, you can also set `value` to `true` or `false` and it
	* will behave the same way as `.eq()`.
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/
	is(column, value) {
		this.url.searchParams.append(column, `is.${value}`);
		return this;
	}
	/**
	* Match only rows where `column` IS DISTINCT FROM `value`.
	*
	* Unlike `.neq()`, this treats `NULL` as a comparable value. Two `NULL` values
	* are considered equal (not distinct), and comparing `NULL` with any non-NULL
	* value returns true (distinct).
	*
	* @param column - The column to filter on
	* @param value - The value to filter with
	*/
	isDistinct(column, value) {
		this.url.searchParams.append(column, `isdistinct.${value}`);
		return this;
	}
	/**
	* Match only rows where `column` is included in the `values` array.
	*
	* @param column - The column to filter on
	* @param values - The values array to filter with
	*/
	in(column, values) {
		const cleanedValues = Array.from(new Set(values)).map((s) => {
			if (typeof s === "string" && PostgrestReservedCharsRegexp.test(s)) return `"${s}"`;
			else return `${s}`;
		}).join(",");
		this.url.searchParams.append(column, `in.(${cleanedValues})`);
		return this;
	}
	/**
	* Match only rows where `column` is NOT included in the `values` array.
	*
	* @param column - The column to filter on
	* @param values - The values array to filter with
	*/
	notIn(column, values) {
		const cleanedValues = Array.from(new Set(values)).map((s) => {
			if (typeof s === "string" && PostgrestReservedCharsRegexp.test(s)) return `"${s}"`;
			else return `${s}`;
		}).join(",");
		this.url.searchParams.append(column, `not.in.(${cleanedValues})`);
		return this;
	}
	/**
	* Only relevant for jsonb, array, and range columns. Match only rows where
	* `column` contains every element appearing in `value`.
	*
	* @param column - The jsonb, array, or range column to filter on
	* @param value - The jsonb, array, or range value to filter with
	*/
	contains(column, value) {
		if (typeof value === "string") this.url.searchParams.append(column, `cs.${value}`);
		else if (Array.isArray(value)) this.url.searchParams.append(column, `cs.{${value.join(",")}}`);
		else this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
		return this;
	}
	/**
	* Only relevant for jsonb, array, and range columns. Match only rows where
	* every element appearing in `column` is contained by `value`.
	*
	* @param column - The jsonb, array, or range column to filter on
	* @param value - The jsonb, array, or range value to filter with
	*/
	containedBy(column, value) {
		if (typeof value === "string") this.url.searchParams.append(column, `cd.${value}`);
		else if (Array.isArray(value)) this.url.searchParams.append(column, `cd.{${value.join(",")}}`);
		else this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
		return this;
	}
	/**
	* Only relevant for range columns. Match only rows where every element in
	* `column` is greater than any element in `range`.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/
	rangeGt(column, range) {
		this.url.searchParams.append(column, `sr.${range}`);
		return this;
	}
	/**
	* Only relevant for range columns. Match only rows where every element in
	* `column` is either contained in `range` or greater than any element in
	* `range`.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/
	rangeGte(column, range) {
		this.url.searchParams.append(column, `nxl.${range}`);
		return this;
	}
	/**
	* Only relevant for range columns. Match only rows where every element in
	* `column` is less than any element in `range`.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/
	rangeLt(column, range) {
		this.url.searchParams.append(column, `sl.${range}`);
		return this;
	}
	/**
	* Only relevant for range columns. Match only rows where every element in
	* `column` is either contained in `range` or less than any element in
	* `range`.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/
	rangeLte(column, range) {
		this.url.searchParams.append(column, `nxr.${range}`);
		return this;
	}
	/**
	* Only relevant for range columns. Match only rows where `column` is
	* mutually exclusive to `range` and there can be no element between the two
	* ranges.
	*
	* @param column - The range column to filter on
	* @param range - The range to filter with
	*/
	rangeAdjacent(column, range) {
		this.url.searchParams.append(column, `adj.${range}`);
		return this;
	}
	/**
	* Only relevant for array and range columns. Match only rows where
	* `column` and `value` have an element in common.
	*
	* @param column - The array or range column to filter on
	* @param value - The array or range value to filter with
	*/
	overlaps(column, value) {
		if (typeof value === "string") this.url.searchParams.append(column, `ov.${value}`);
		else this.url.searchParams.append(column, `ov.{${value.join(",")}}`);
		return this;
	}
	/**
	* Only relevant for text and tsvector columns. Match only rows where
	* `column` matches the query string in `query`.
	*
	* @param column - The text or tsvector column to filter on
	* @param query - The query text to match with
	* @param options - Named parameters
	* @param options.config - The text search configuration to use
	* @param options.type - Change how the `query` text is interpreted
	*/
	textSearch(column, query, { config, type } = {}) {
		let typePart = "";
		if (type === "plain") typePart = "pl";
		else if (type === "phrase") typePart = "ph";
		else if (type === "websearch") typePart = "w";
		const configPart = config === void 0 ? "" : `(${config})`;
		this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
		return this;
	}
	/**
	* Match only rows where each column in `query` keys is equal to its
	* associated value. Shorthand for multiple `.eq()`s.
	*
	* @param query - The object to filter with, with column names as keys mapped
	* to their filter values
	*/
	match(query) {
		Object.entries(query).forEach(([column, value]) => {
			this.url.searchParams.append(column, `eq.${value}`);
		});
		return this;
	}
	/**
	* Match only rows which doesn't satisfy the filter.
	*
	* Unlike most filters, `opearator` and `value` are used as-is and need to
	* follow [PostgREST
	* syntax](https://postgrest.org/en/stable/api.html#operators). You also need
	* to make sure they are properly sanitized.
	*
	* @param column - The column to filter on
	* @param operator - The operator to be negated to filter with, following
	* PostgREST syntax
	* @param value - The value to filter with, following PostgREST syntax
	*/
	not(column, operator, value) {
		this.url.searchParams.append(column, `not.${operator}.${value}`);
		return this;
	}
	/**
	* Match only rows which satisfy at least one of the filters.
	*
	* Unlike most filters, `filters` is used as-is and needs to follow [PostgREST
	* syntax](https://postgrest.org/en/stable/api.html#operators). You also need
	* to make sure it's properly sanitized.
	*
	* It's currently not possible to do an `.or()` filter across multiple tables.
	*
	* @param filters - The filters to use, following PostgREST syntax
	* @param options - Named parameters
	* @param options.referencedTable - Set this to filter on referenced tables
	* instead of the parent table
	* @param options.foreignTable - Deprecated, use `referencedTable` instead
	*/
	or(filters, { foreignTable, referencedTable = foreignTable } = {}) {
		const key = referencedTable ? `${referencedTable}.or` : "or";
		this.url.searchParams.append(key, `(${filters})`);
		return this;
	}
	/**
	* Match only rows which satisfy the filter. This is an escape hatch - you
	* should use the specific filter methods wherever possible.
	*
	* Unlike most filters, `opearator` and `value` are used as-is and need to
	* follow [PostgREST
	* syntax](https://postgrest.org/en/stable/api.html#operators). You also need
	* to make sure they are properly sanitized.
	*
	* @param column - The column to filter on
	* @param operator - The operator to filter with, following PostgREST syntax
	* @param value - The value to filter with, following PostgREST syntax
	*/
	filter(column, operator, value) {
		this.url.searchParams.append(column, `${operator}.${value}`);
		return this;
	}
};

//#endregion
//#region src/PostgrestQueryBuilder.ts
var PostgrestQueryBuilder = class {
	/**
	* Creates a query builder scoped to a Postgres table or view.
	*
	* @example
	* ```ts
	* import PostgrestQueryBuilder from '@supabase/postgrest-js'
	*
	* const query = new PostgrestQueryBuilder(
	*   new URL('https://xyzcompany.supabase.co/rest/v1/users'),
	*   { headers: { apikey: 'public-anon-key' } }
	* )
	* ```
	*/
	constructor(url, { headers = {}, schema, fetch: fetch$1 }) {
		this.url = url;
		this.headers = new Headers(headers);
		this.schema = schema;
		this.fetch = fetch$1;
	}
	/**
	* Clone URL and headers to prevent shared state between operations.
	*/
	cloneRequestState() {
		return {
			url: new URL(this.url.toString()),
			headers: new Headers(this.headers)
		};
	}
	/**
	* Perform a SELECT query on the table or view.
	*
	* @param columns - The columns to retrieve, separated by commas. Columns can be renamed when returned with `customName:columnName`
	*
	* @param options - Named parameters
	*
	* @param options.head - When set to `true`, `data` will not be returned.
	* Useful if you only need the count.
	*
	* @param options.count - Count algorithm to use to count rows in the table or view.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*/
	select(columns, options) {
		const { head = false, count } = options !== null && options !== void 0 ? options : {};
		const method = head ? "HEAD" : "GET";
		let quoted = false;
		const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
			if (/\s/.test(c) && !quoted) return "";
			if (c === "\"") quoted = !quoted;
			return c;
		}).join("");
		const { url, headers } = this.cloneRequestState();
		url.searchParams.set("select", cleanedColumns);
		if (count) headers.append("Prefer", `count=${count}`);
		return new PostgrestFilterBuilder({
			method,
			url,
			headers,
			schema: this.schema,
			fetch: this.fetch
		});
	}
	/**
	* Perform an INSERT into the table or view.
	*
	* By default, inserted rows are not returned. To return it, chain the call
	* with `.select()`.
	*
	* @param values - The values to insert. Pass an object to insert a single row
	* or an array to insert multiple rows.
	*
	* @param options - Named parameters
	*
	* @param options.count - Count algorithm to use to count inserted rows.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*
	* @param options.defaultToNull - Make missing fields default to `null`.
	* Otherwise, use the default value for the column. Only applies for bulk
	* inserts.
	*/
	insert(values, { count, defaultToNull = true } = {}) {
		var _this$fetch;
		const method = "POST";
		const { url, headers } = this.cloneRequestState();
		if (count) headers.append("Prefer", `count=${count}`);
		if (!defaultToNull) headers.append("Prefer", `missing=default`);
		if (Array.isArray(values)) {
			const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
			if (columns.length > 0) {
				const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
				url.searchParams.set("columns", uniqueColumns.join(","));
			}
		}
		return new PostgrestFilterBuilder({
			method,
			url,
			headers,
			schema: this.schema,
			body: values,
			fetch: (_this$fetch = this.fetch) !== null && _this$fetch !== void 0 ? _this$fetch : fetch
		});
	}
	/**
	* Perform an UPSERT on the table or view. Depending on the column(s) passed
	* to `onConflict`, `.upsert()` allows you to perform the equivalent of
	* `.insert()` if a row with the corresponding `onConflict` columns doesn't
	* exist, or if it does exist, perform an alternative action depending on
	* `ignoreDuplicates`.
	*
	* By default, upserted rows are not returned. To return it, chain the call
	* with `.select()`.
	*
	* @param values - The values to upsert with. Pass an object to upsert a
	* single row or an array to upsert multiple rows.
	*
	* @param options - Named parameters
	*
	* @param options.onConflict - Comma-separated UNIQUE column(s) to specify how
	* duplicate rows are determined. Two rows are duplicates if all the
	* `onConflict` columns are equal.
	*
	* @param options.ignoreDuplicates - If `true`, duplicate rows are ignored. If
	* `false`, duplicate rows are merged with existing rows.
	*
	* @param options.count - Count algorithm to use to count upserted rows.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*
	* @param options.defaultToNull - Make missing fields default to `null`.
	* Otherwise, use the default value for the column. This only applies when
	* inserting new rows, not when merging with existing rows under
	* `ignoreDuplicates: false`. This also only applies when doing bulk upserts.
	*
	* @example Upsert a single row using a unique key
	* ```ts
	* // Upserting a single row, overwriting based on the 'username' unique column
	* const { data, error } = await supabase
	*   .from('users')
	*   .upsert({ username: 'supabot' }, { onConflict: 'username' })
	*
	* // Example response:
	* // {
	* //   data: [
	* //     { id: 4, message: 'bar', username: 'supabot' }
	* //   ],
	* //   error: null
	* // }
	* ```
	*
	* @example Upsert with conflict resolution and exact row counting
	* ```ts
	* // Upserting and returning exact count
	* const { data, error, count } = await supabase
	*   .from('users')
	*   .upsert(
	*     {
	*       id: 3,
	*       message: 'foo',
	*       username: 'supabot'
	*     },
	*     {
	*       onConflict: 'username',
	*       count: 'exact'
	*     }
	*   )
	*
	* // Example response:
	* // {
	* //   data: [
	* //     {
	* //       id: 42,
	* //       handle: "saoirse",
	* //       display_name: "Saoirse"
	* //     }
	* //   ],
	* //   count: 1,
	* //   error: null
	* // }
	* ```
	*/
	upsert(values, { onConflict, ignoreDuplicates = false, count, defaultToNull = true } = {}) {
		var _this$fetch2;
		const method = "POST";
		const { url, headers } = this.cloneRequestState();
		headers.append("Prefer", `resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`);
		if (onConflict !== void 0) url.searchParams.set("on_conflict", onConflict);
		if (count) headers.append("Prefer", `count=${count}`);
		if (!defaultToNull) headers.append("Prefer", "missing=default");
		if (Array.isArray(values)) {
			const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
			if (columns.length > 0) {
				const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
				url.searchParams.set("columns", uniqueColumns.join(","));
			}
		}
		return new PostgrestFilterBuilder({
			method,
			url,
			headers,
			schema: this.schema,
			body: values,
			fetch: (_this$fetch2 = this.fetch) !== null && _this$fetch2 !== void 0 ? _this$fetch2 : fetch
		});
	}
	/**
	* Perform an UPDATE on the table or view.
	*
	* By default, updated rows are not returned. To return it, chain the call
	* with `.select()` after filters.
	*
	* @param values - The values to update with
	*
	* @param options - Named parameters
	*
	* @param options.count - Count algorithm to use to count updated rows.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*/
	update(values, { count } = {}) {
		var _this$fetch3;
		const method = "PATCH";
		const { url, headers } = this.cloneRequestState();
		if (count) headers.append("Prefer", `count=${count}`);
		return new PostgrestFilterBuilder({
			method,
			url,
			headers,
			schema: this.schema,
			body: values,
			fetch: (_this$fetch3 = this.fetch) !== null && _this$fetch3 !== void 0 ? _this$fetch3 : fetch
		});
	}
	/**
	* Perform a DELETE on the table or view.
	*
	* By default, deleted rows are not returned. To return it, chain the call
	* with `.select()` after filters.
	*
	* @param options - Named parameters
	*
	* @param options.count - Count algorithm to use to count deleted rows.
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*/
	delete({ count } = {}) {
		var _this$fetch4;
		const method = "DELETE";
		const { url, headers } = this.cloneRequestState();
		if (count) headers.append("Prefer", `count=${count}`);
		return new PostgrestFilterBuilder({
			method,
			url,
			headers,
			schema: this.schema,
			fetch: (_this$fetch4 = this.fetch) !== null && _this$fetch4 !== void 0 ? _this$fetch4 : fetch
		});
	}
};

//#endregion
//#region src/PostgrestClient.ts
/**
* PostgREST client.
*
* @typeParam Database - Types for the schema from the [type
* generator](https://supabase.com/docs/reference/javascript/next/typescript-support)
*
* @typeParam SchemaName - Postgres schema to switch to. Must be a string
* literal, the same one passed to the constructor. If the schema is not
* `"public"`, this must be supplied manually.
*/
var PostgrestClient = class PostgrestClient {
	/**
	* Creates a PostgREST client.
	*
	* @param url - URL of the PostgREST endpoint
	* @param options - Named parameters
	* @param options.headers - Custom headers
	* @param options.schema - Postgres schema to switch to
	* @param options.fetch - Custom fetch
	* @example
	* ```ts
	* import PostgrestClient from '@supabase/postgrest-js'
	*
	* const postgrest = new PostgrestClient('https://xyzcompany.supabase.co/rest/v1', {
	*   headers: { apikey: 'public-anon-key' },
	*   schema: 'public',
	* })
	* ```
	*/
	constructor(url, { headers = {}, schema, fetch: fetch$1 } = {}) {
		this.url = url;
		this.headers = new Headers(headers);
		this.schemaName = schema;
		this.fetch = fetch$1;
	}
	/**
	* Perform a query on a table or a view.
	*
	* @param relation - The table or view name to query
	*/
	from(relation) {
		if (!relation || typeof relation !== "string" || relation.trim() === "") throw new Error("Invalid relation name: relation must be a non-empty string.");
		return new PostgrestQueryBuilder(new URL(`${this.url}/${relation}`), {
			headers: new Headers(this.headers),
			schema: this.schemaName,
			fetch: this.fetch
		});
	}
	/**
	* Select a schema to query or perform an function (rpc) call.
	*
	* The schema needs to be on the list of exposed schemas inside Supabase.
	*
	* @param schema - The schema to query
	*/
	schema(schema) {
		return new PostgrestClient(this.url, {
			headers: this.headers,
			schema,
			fetch: this.fetch
		});
	}
	/**
	* Perform a function call.
	*
	* @param fn - The function name to call
	* @param args - The arguments to pass to the function call
	* @param options - Named parameters
	* @param options.head - When set to `true`, `data` will not be returned.
	* Useful if you only need the count.
	* @param options.get - When set to `true`, the function will be called with
	* read-only access mode.
	* @param options.count - Count algorithm to use to count rows returned by the
	* function. Only applicable for [set-returning
	* functions](https://www.postgresql.org/docs/current/functions-srf.html).
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*
	* @example
	* ```ts
	* // For cross-schema functions where type inference fails, use overrideTypes:
	* const { data } = await supabase
	*   .schema('schema_b')
	*   .rpc('function_a', {})
	*   .overrideTypes<{ id: string; user_id: string }[]>()
	* ```
	*/
	rpc(fn, args = {}, { head = false, get = false, count } = {}) {
		var _this$fetch;
		let method;
		const url = new URL(`${this.url}/rpc/${fn}`);
		let body;
		const _isObject = (v) => v !== null && typeof v === "object" && (!Array.isArray(v) || v.some(_isObject));
		const _hasObjectArg = head && Object.values(args).some(_isObject);
		if (_hasObjectArg) {
			method = "POST";
			body = args;
		} else if (head || get) {
			method = head ? "HEAD" : "GET";
			Object.entries(args).filter(([_, value]) => value !== void 0).map(([name, value]) => [name, Array.isArray(value) ? `{${value.join(",")}}` : `${value}`]).forEach(([name, value]) => {
				url.searchParams.append(name, value);
			});
		} else {
			method = "POST";
			body = args;
		}
		const headers = new Headers(this.headers);
		if (_hasObjectArg) headers.set("Prefer", count ? `count=${count},return=minimal` : "return=minimal");
		else if (count) headers.set("Prefer", `count=${count}`);
		return new PostgrestFilterBuilder({
			method,
			url,
			headers,
			schema: this.schemaName,
			body,
			fetch: (_this$fetch = this.fetch) !== null && _this$fetch !== void 0 ? _this$fetch : fetch
		});
	}
};

/**
 * Utilities for creating WebSocket instances across runtimes.
 */
class WebSocketFactory {
    /**
     * Static-only utility – prevent instantiation.
     */
    constructor() { }
    static detectEnvironment() {
        var _a;
        if (typeof WebSocket !== 'undefined') {
            return { type: 'native', constructor: WebSocket };
        }
        if (typeof globalThis !== 'undefined' && typeof globalThis.WebSocket !== 'undefined') {
            return { type: 'native', constructor: globalThis.WebSocket };
        }
        if (typeof global !== 'undefined' && typeof global.WebSocket !== 'undefined') {
            return { type: 'native', constructor: global.WebSocket };
        }
        if (typeof globalThis !== 'undefined' &&
            typeof globalThis.WebSocketPair !== 'undefined' &&
            typeof globalThis.WebSocket === 'undefined') {
            return {
                type: 'cloudflare',
                error: 'Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.',
                workaround: 'Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime.',
            };
        }
        if ((typeof globalThis !== 'undefined' && globalThis.EdgeRuntime) ||
            (typeof navigator !== 'undefined' && ((_a = navigator.userAgent) === null || _a === void 0 ? void 0 : _a.includes('Vercel-Edge')))) {
            return {
                type: 'unsupported',
                error: 'Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.',
                workaround: 'Use serverless functions or a different deployment target for WebSocket functionality.',
            };
        }
        // Use dynamic property access to avoid Next.js Edge Runtime static analysis warnings
        const _process = globalThis['process'];
        if (_process) {
            const processVersions = _process['versions'];
            if (processVersions && processVersions['node']) {
                // Remove 'v' prefix if present and parse the major version
                const versionString = processVersions['node'];
                const nodeVersion = parseInt(versionString.replace(/^v/, '').split('.')[0]);
                // Node.js 22+ should have native WebSocket
                if (nodeVersion >= 22) {
                    // Check if native WebSocket is available (should be in Node.js 22+)
                    if (typeof globalThis.WebSocket !== 'undefined') {
                        return { type: 'native', constructor: globalThis.WebSocket };
                    }
                    // If not available, user needs to provide it
                    return {
                        type: 'unsupported',
                        error: `Node.js ${nodeVersion} detected but native WebSocket not found.`,
                        workaround: 'Provide a WebSocket implementation via the transport option.',
                    };
                }
                // Node.js < 22 doesn't have native WebSocket
                return {
                    type: 'unsupported',
                    error: `Node.js ${nodeVersion} detected without native WebSocket support.`,
                    workaround: 'For Node.js < 22, install "ws" package and provide it via the transport option:\n' +
                        'import ws from "ws"\n' +
                        'new RealtimeClient(url, { transport: ws })',
                };
            }
        }
        return {
            type: 'unsupported',
            error: 'Unknown JavaScript runtime without WebSocket support.',
            workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation.",
        };
    }
    /**
     * Returns the best available WebSocket constructor for the current runtime.
     *
     * @example
     * ```ts
     * const WS = WebSocketFactory.getWebSocketConstructor()
     * const socket = new WS('wss://realtime.supabase.co/socket')
     * ```
     */
    static getWebSocketConstructor() {
        const env = this.detectEnvironment();
        if (env.constructor) {
            return env.constructor;
        }
        let errorMessage = env.error || 'WebSocket not supported in this environment.';
        if (env.workaround) {
            errorMessage += `\n\nSuggested solution: ${env.workaround}`;
        }
        throw new Error(errorMessage);
    }
    /**
     * Creates a WebSocket using the detected constructor.
     *
     * @example
     * ```ts
     * const socket = WebSocketFactory.createWebSocket('wss://realtime.supabase.co/socket')
     * ```
     */
    static createWebSocket(url, protocols) {
        const WS = this.getWebSocketConstructor();
        return new WS(url, protocols);
    }
    /**
     * Detects whether the runtime can establish WebSocket connections.
     *
     * @example
     * ```ts
     * if (!WebSocketFactory.isWebSocketSupported()) {
     *   console.warn('Falling back to long polling')
     * }
     * ```
     */
    static isWebSocketSupported() {
        try {
            const env = this.detectEnvironment();
            return env.type === 'native' || env.type === 'ws';
        }
        catch (_a) {
            return false;
        }
    }
}

// Generated automatically during releases by scripts/update-version-files.ts
// This file provides runtime access to the package version for:
// - HTTP request headers (e.g., X-Client-Info header for API requests)
// - Debugging and support (identifying which version is running)
// - Telemetry and logging (version reporting in errors/analytics)
// - Ensuring build artifacts match the published package version
const version$3 = '2.91.1';

const DEFAULT_VERSION = `realtime-js/${version$3}`;
const VSN_1_0_0 = '1.0.0';
const VSN_2_0_0 = '2.0.0';
const DEFAULT_VSN = VSN_2_0_0;
const DEFAULT_TIMEOUT = 10000;
const WS_CLOSE_NORMAL = 1000;
const MAX_PUSH_BUFFER_SIZE = 100;
var SOCKET_STATES;
(function (SOCKET_STATES) {
    SOCKET_STATES[SOCKET_STATES["connecting"] = 0] = "connecting";
    SOCKET_STATES[SOCKET_STATES["open"] = 1] = "open";
    SOCKET_STATES[SOCKET_STATES["closing"] = 2] = "closing";
    SOCKET_STATES[SOCKET_STATES["closed"] = 3] = "closed";
})(SOCKET_STATES || (SOCKET_STATES = {}));
var CHANNEL_STATES;
(function (CHANNEL_STATES) {
    CHANNEL_STATES["closed"] = "closed";
    CHANNEL_STATES["errored"] = "errored";
    CHANNEL_STATES["joined"] = "joined";
    CHANNEL_STATES["joining"] = "joining";
    CHANNEL_STATES["leaving"] = "leaving";
})(CHANNEL_STATES || (CHANNEL_STATES = {}));
var CHANNEL_EVENTS;
(function (CHANNEL_EVENTS) {
    CHANNEL_EVENTS["close"] = "phx_close";
    CHANNEL_EVENTS["error"] = "phx_error";
    CHANNEL_EVENTS["join"] = "phx_join";
    CHANNEL_EVENTS["reply"] = "phx_reply";
    CHANNEL_EVENTS["leave"] = "phx_leave";
    CHANNEL_EVENTS["access_token"] = "access_token";
})(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
var TRANSPORTS;
(function (TRANSPORTS) {
    TRANSPORTS["websocket"] = "websocket";
})(TRANSPORTS || (TRANSPORTS = {}));
var CONNECTION_STATE;
(function (CONNECTION_STATE) {
    CONNECTION_STATE["Connecting"] = "connecting";
    CONNECTION_STATE["Open"] = "open";
    CONNECTION_STATE["Closing"] = "closing";
    CONNECTION_STATE["Closed"] = "closed";
})(CONNECTION_STATE || (CONNECTION_STATE = {}));

class Serializer {
    constructor(allowedMetadataKeys) {
        this.HEADER_LENGTH = 1;
        this.USER_BROADCAST_PUSH_META_LENGTH = 6;
        this.KINDS = { userBroadcastPush: 3, userBroadcast: 4 };
        this.BINARY_ENCODING = 0;
        this.JSON_ENCODING = 1;
        this.BROADCAST_EVENT = 'broadcast';
        this.allowedMetadataKeys = [];
        this.allowedMetadataKeys = allowedMetadataKeys !== null && allowedMetadataKeys !== void 0 ? allowedMetadataKeys : [];
    }
    encode(msg, callback) {
        if (msg.event === this.BROADCAST_EVENT &&
            !(msg.payload instanceof ArrayBuffer) &&
            typeof msg.payload.event === 'string') {
            return callback(this._binaryEncodeUserBroadcastPush(msg));
        }
        let payload = [msg.join_ref, msg.ref, msg.topic, msg.event, msg.payload];
        return callback(JSON.stringify(payload));
    }
    _binaryEncodeUserBroadcastPush(message) {
        var _a;
        if (this._isArrayBuffer((_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload)) {
            return this._encodeBinaryUserBroadcastPush(message);
        }
        else {
            return this._encodeJsonUserBroadcastPush(message);
        }
    }
    _encodeBinaryUserBroadcastPush(message) {
        var _a, _b;
        const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : new ArrayBuffer(0);
        return this._encodeUserBroadcastPush(message, this.BINARY_ENCODING, userPayload);
    }
    _encodeJsonUserBroadcastPush(message) {
        var _a, _b;
        const userPayload = (_b = (_a = message.payload) === null || _a === void 0 ? void 0 : _a.payload) !== null && _b !== void 0 ? _b : {};
        const encoder = new TextEncoder();
        const encodedUserPayload = encoder.encode(JSON.stringify(userPayload)).buffer;
        return this._encodeUserBroadcastPush(message, this.JSON_ENCODING, encodedUserPayload);
    }
    _encodeUserBroadcastPush(message, encodingType, encodedPayload) {
        var _a, _b;
        const topic = message.topic;
        const ref = (_a = message.ref) !== null && _a !== void 0 ? _a : '';
        const joinRef = (_b = message.join_ref) !== null && _b !== void 0 ? _b : '';
        const userEvent = message.payload.event;
        // Filter metadata based on allowed keys
        const rest = this.allowedMetadataKeys
            ? this._pick(message.payload, this.allowedMetadataKeys)
            : {};
        const metadata = Object.keys(rest).length === 0 ? '' : JSON.stringify(rest);
        // Validate lengths don't exceed uint8 max value (255)
        if (joinRef.length > 255) {
            throw new Error(`joinRef length ${joinRef.length} exceeds maximum of 255`);
        }
        if (ref.length > 255) {
            throw new Error(`ref length ${ref.length} exceeds maximum of 255`);
        }
        if (topic.length > 255) {
            throw new Error(`topic length ${topic.length} exceeds maximum of 255`);
        }
        if (userEvent.length > 255) {
            throw new Error(`userEvent length ${userEvent.length} exceeds maximum of 255`);
        }
        if (metadata.length > 255) {
            throw new Error(`metadata length ${metadata.length} exceeds maximum of 255`);
        }
        const metaLength = this.USER_BROADCAST_PUSH_META_LENGTH +
            joinRef.length +
            ref.length +
            topic.length +
            userEvent.length +
            metadata.length;
        const header = new ArrayBuffer(this.HEADER_LENGTH + metaLength);
        let view = new DataView(header);
        let offset = 0;
        view.setUint8(offset++, this.KINDS.userBroadcastPush); // kind
        view.setUint8(offset++, joinRef.length);
        view.setUint8(offset++, ref.length);
        view.setUint8(offset++, topic.length);
        view.setUint8(offset++, userEvent.length);
        view.setUint8(offset++, metadata.length);
        view.setUint8(offset++, encodingType);
        Array.from(joinRef, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(ref, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(topic, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(userEvent, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        Array.from(metadata, (char) => view.setUint8(offset++, char.charCodeAt(0)));
        var combined = new Uint8Array(header.byteLength + encodedPayload.byteLength);
        combined.set(new Uint8Array(header), 0);
        combined.set(new Uint8Array(encodedPayload), header.byteLength);
        return combined.buffer;
    }
    decode(rawPayload, callback) {
        if (this._isArrayBuffer(rawPayload)) {
            let result = this._binaryDecode(rawPayload);
            return callback(result);
        }
        if (typeof rawPayload === 'string') {
            const jsonPayload = JSON.parse(rawPayload);
            const [join_ref, ref, topic, event, payload] = jsonPayload;
            return callback({ join_ref, ref, topic, event, payload });
        }
        return callback({});
    }
    _binaryDecode(buffer) {
        const view = new DataView(buffer);
        const kind = view.getUint8(0);
        const decoder = new TextDecoder();
        switch (kind) {
            case this.KINDS.userBroadcast:
                return this._decodeUserBroadcast(buffer, view, decoder);
        }
    }
    _decodeUserBroadcast(buffer, view, decoder) {
        const topicSize = view.getUint8(1);
        const userEventSize = view.getUint8(2);
        const metadataSize = view.getUint8(3);
        const payloadEncoding = view.getUint8(4);
        let offset = this.HEADER_LENGTH + 4;
        const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
        offset = offset + topicSize;
        const userEvent = decoder.decode(buffer.slice(offset, offset + userEventSize));
        offset = offset + userEventSize;
        const metadata = decoder.decode(buffer.slice(offset, offset + metadataSize));
        offset = offset + metadataSize;
        const payload = buffer.slice(offset, buffer.byteLength);
        const parsedPayload = payloadEncoding === this.JSON_ENCODING ? JSON.parse(decoder.decode(payload)) : payload;
        const data = {
            type: this.BROADCAST_EVENT,
            event: userEvent,
            payload: parsedPayload,
        };
        // Metadata is optional and always JSON encoded
        if (metadataSize > 0) {
            data['meta'] = JSON.parse(metadata);
        }
        return { join_ref: null, ref: null, topic: topic, event: this.BROADCAST_EVENT, payload: data };
    }
    _isArrayBuffer(buffer) {
        var _a;
        return buffer instanceof ArrayBuffer || ((_a = buffer === null || buffer === void 0 ? void 0 : buffer.constructor) === null || _a === void 0 ? void 0 : _a.name) === 'ArrayBuffer';
    }
    _pick(obj, keys) {
        if (!obj || typeof obj !== 'object') {
            return {};
        }
        return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));
    }
}

/**
 * Creates a timer that accepts a `timerCalc` function to perform calculated timeout retries, such as exponential backoff.
 *
 * @example
 *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
 *      return [1000, 5000, 10000][tries - 1] || 10000
 *    })
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 *    reconnectTimer.scheduleTimeout() // fires after 5000
 *    reconnectTimer.reset()
 *    reconnectTimer.scheduleTimeout() // fires after 1000
 */
class Timer {
    constructor(callback, timerCalc) {
        this.callback = callback;
        this.timerCalc = timerCalc;
        this.timer = undefined;
        this.tries = 0;
        this.callback = callback;
        this.timerCalc = timerCalc;
    }
    reset() {
        this.tries = 0;
        clearTimeout(this.timer);
        this.timer = undefined;
    }
    // Cancels any previous scheduleTimeout and schedules callback
    scheduleTimeout() {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.tries = this.tries + 1;
            this.callback();
        }, this.timerCalc(this.tries + 1));
    }
}

/**
 * Helpers to convert the change Payload into native JS types.
 */
// Adapted from epgsql (src/epgsql_binary.erl), this module licensed under
// 3-clause BSD found here: https://raw.githubusercontent.com/epgsql/epgsql/devel/LICENSE
var PostgresTypes;
(function (PostgresTypes) {
    PostgresTypes["abstime"] = "abstime";
    PostgresTypes["bool"] = "bool";
    PostgresTypes["date"] = "date";
    PostgresTypes["daterange"] = "daterange";
    PostgresTypes["float4"] = "float4";
    PostgresTypes["float8"] = "float8";
    PostgresTypes["int2"] = "int2";
    PostgresTypes["int4"] = "int4";
    PostgresTypes["int4range"] = "int4range";
    PostgresTypes["int8"] = "int8";
    PostgresTypes["int8range"] = "int8range";
    PostgresTypes["json"] = "json";
    PostgresTypes["jsonb"] = "jsonb";
    PostgresTypes["money"] = "money";
    PostgresTypes["numeric"] = "numeric";
    PostgresTypes["oid"] = "oid";
    PostgresTypes["reltime"] = "reltime";
    PostgresTypes["text"] = "text";
    PostgresTypes["time"] = "time";
    PostgresTypes["timestamp"] = "timestamp";
    PostgresTypes["timestamptz"] = "timestamptz";
    PostgresTypes["timetz"] = "timetz";
    PostgresTypes["tsrange"] = "tsrange";
    PostgresTypes["tstzrange"] = "tstzrange";
})(PostgresTypes || (PostgresTypes = {}));
/**
 * Takes an array of columns and an object of string values then converts each string value
 * to its mapped type.
 *
 * @param {{name: String, type: String}[]} columns
 * @param {Object} record
 * @param {Object} options The map of various options that can be applied to the mapper
 * @param {Array} options.skipTypes The array of types that should not be converted
 *
 * @example convertChangeData([{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age:'33'}, {})
 * //=>{ first_name: 'Paul', age: 33 }
 */
const convertChangeData = (columns, record, options = {}) => {
    var _a;
    const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
    if (!record) {
        return {};
    }
    return Object.keys(record).reduce((acc, rec_key) => {
        acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
        return acc;
    }, {});
};
/**
 * Converts the value of an individual column.
 *
 * @param {String} columnName The column that you want to convert
 * @param {{name: String, type: String}[]} columns All of the columns
 * @param {Object} record The map of string values
 * @param {Array} skipTypes An array of types that should not be converted
 * @return {object} Useless information
 *
 * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, [])
 * //=> 33
 * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, ['int4'])
 * //=> "33"
 */
const convertColumn = (columnName, columns, record, skipTypes) => {
    const column = columns.find((x) => x.name === columnName);
    const colType = column === null || column === void 0 ? void 0 : column.type;
    const value = record[columnName];
    if (colType && !skipTypes.includes(colType)) {
        return convertCell(colType, value);
    }
    return noop$1(value);
};
/**
 * If the value of the cell is `null`, returns null.
 * Otherwise converts the string value to the correct type.
 * @param {String} type A postgres column type
 * @param {String} value The cell value
 *
 * @example convertCell('bool', 't')
 * //=> true
 * @example convertCell('int8', '10')
 * //=> 10
 * @example convertCell('_int4', '{1,2,3,4}')
 * //=> [1,2,3,4]
 */
const convertCell = (type, value) => {
    // if data type is an array
    if (type.charAt(0) === '_') {
        const dataType = type.slice(1, type.length);
        return toArray(value, dataType);
    }
    // If not null, convert to correct type.
    switch (type) {
        case PostgresTypes.bool:
            return toBoolean(value);
        case PostgresTypes.float4:
        case PostgresTypes.float8:
        case PostgresTypes.int2:
        case PostgresTypes.int4:
        case PostgresTypes.int8:
        case PostgresTypes.numeric:
        case PostgresTypes.oid:
            return toNumber(value);
        case PostgresTypes.json:
        case PostgresTypes.jsonb:
            return toJson(value);
        case PostgresTypes.timestamp:
            return toTimestampString(value); // Format to be consistent with PostgREST
        case PostgresTypes.abstime: // To allow users to cast it based on Timezone
        case PostgresTypes.date: // To allow users to cast it based on Timezone
        case PostgresTypes.daterange:
        case PostgresTypes.int4range:
        case PostgresTypes.int8range:
        case PostgresTypes.money:
        case PostgresTypes.reltime: // To allow users to cast it based on Timezone
        case PostgresTypes.text:
        case PostgresTypes.time: // To allow users to cast it based on Timezone
        case PostgresTypes.timestamptz: // To allow users to cast it based on Timezone
        case PostgresTypes.timetz: // To allow users to cast it based on Timezone
        case PostgresTypes.tsrange:
        case PostgresTypes.tstzrange:
            return noop$1(value);
        default:
            // Return the value for remaining types
            return noop$1(value);
    }
};
const noop$1 = (value) => {
    return value;
};
const toBoolean = (value) => {
    switch (value) {
        case 't':
            return true;
        case 'f':
            return false;
        default:
            return value;
    }
};
const toNumber = (value) => {
    if (typeof value === 'string') {
        const parsedValue = parseFloat(value);
        if (!Number.isNaN(parsedValue)) {
            return parsedValue;
        }
    }
    return value;
};
const toJson = (value) => {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        }
        catch (_a) {
            return value;
        }
    }
    return value;
};
/**
 * Converts a Postgres Array into a native JS array
 *
 * @example toArray('{}', 'int4')
 * //=> []
 * @example toArray('{"[2021-01-01,2021-12-31)","(2021-01-01,2021-12-32]"}', 'daterange')
 * //=> ['[2021-01-01,2021-12-31)', '(2021-01-01,2021-12-32]']
 * @example toArray([1,2,3,4], 'int4')
 * //=> [1,2,3,4]
 */
const toArray = (value, type) => {
    if (typeof value !== 'string') {
        return value;
    }
    const lastIdx = value.length - 1;
    const closeBrace = value[lastIdx];
    const openBrace = value[0];
    // Confirm value is a Postgres array by checking curly brackets
    if (openBrace === '{' && closeBrace === '}') {
        let arr;
        const valTrim = value.slice(1, lastIdx);
        // TODO: find a better solution to separate Postgres array data
        try {
            arr = JSON.parse('[' + valTrim + ']');
        }
        catch (_) {
            // WARNING: splitting on comma does not cover all edge cases
            arr = valTrim ? valTrim.split(',') : [];
        }
        return arr.map((val) => convertCell(type, val));
    }
    return value;
};
/**
 * Fixes timestamp to be ISO-8601. Swaps the space between the date and time for a 'T'
 * See https://github.com/supabase/supabase/issues/18
 *
 * @example toTimestampString('2019-09-10 00:00:00')
 * //=> '2019-09-10T00:00:00'
 */
const toTimestampString = (value) => {
    if (typeof value === 'string') {
        return value.replace(' ', 'T');
    }
    return value;
};
const httpEndpointURL = (socketUrl) => {
    const wsUrl = new URL(socketUrl);
    wsUrl.protocol = wsUrl.protocol.replace(/^ws/i, 'http');
    wsUrl.pathname = wsUrl.pathname
        .replace(/\/+$/, '') // remove all trailing slashes
        .replace(/\/socket\/websocket$/i, '') // remove the socket/websocket path
        .replace(/\/socket$/i, '') // remove the socket path
        .replace(/\/websocket$/i, ''); // remove the websocket path
    if (wsUrl.pathname === '' || wsUrl.pathname === '/') {
        wsUrl.pathname = '/api/broadcast';
    }
    else {
        wsUrl.pathname = wsUrl.pathname + '/api/broadcast';
    }
    return wsUrl.href;
};

class Push {
    /**
     * Initializes the Push
     *
     * @param channel The Channel
     * @param event The event, for example `"phx_join"`
     * @param payload The payload, for example `{user_id: 123}`
     * @param timeout The push timeout in milliseconds
     */
    constructor(channel, event, payload = {}, timeout = DEFAULT_TIMEOUT) {
        this.channel = channel;
        this.event = event;
        this.payload = payload;
        this.timeout = timeout;
        this.sent = false;
        this.timeoutTimer = undefined;
        this.ref = '';
        this.receivedResp = null;
        this.recHooks = [];
        this.refEvent = null;
    }
    resend(timeout) {
        this.timeout = timeout;
        this._cancelRefEvent();
        this.ref = '';
        this.refEvent = null;
        this.receivedResp = null;
        this.sent = false;
        this.send();
    }
    send() {
        if (this._hasReceived('timeout')) {
            return;
        }
        this.startTimeout();
        this.sent = true;
        this.channel.socket.push({
            topic: this.channel.topic,
            event: this.event,
            payload: this.payload,
            ref: this.ref,
            join_ref: this.channel._joinRef(),
        });
    }
    updatePayload(payload) {
        this.payload = Object.assign(Object.assign({}, this.payload), payload);
    }
    receive(status, callback) {
        var _a;
        if (this._hasReceived(status)) {
            callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
        }
        this.recHooks.push({ status, callback });
        return this;
    }
    startTimeout() {
        if (this.timeoutTimer) {
            return;
        }
        this.ref = this.channel.socket._makeRef();
        this.refEvent = this.channel._replyEventName(this.ref);
        const callback = (payload) => {
            this._cancelRefEvent();
            this._cancelTimeout();
            this.receivedResp = payload;
            this._matchReceive(payload);
        };
        this.channel._on(this.refEvent, {}, callback);
        this.timeoutTimer = setTimeout(() => {
            this.trigger('timeout', {});
        }, this.timeout);
    }
    trigger(status, response) {
        if (this.refEvent)
            this.channel._trigger(this.refEvent, { status, response });
    }
    destroy() {
        this._cancelRefEvent();
        this._cancelTimeout();
    }
    _cancelRefEvent() {
        if (!this.refEvent) {
            return;
        }
        this.channel._off(this.refEvent, {});
    }
    _cancelTimeout() {
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = undefined;
    }
    _matchReceive({ status, response }) {
        this.recHooks.filter((h) => h.status === status).forEach((h) => h.callback(response));
    }
    _hasReceived(status) {
        return this.receivedResp && this.receivedResp.status === status;
    }
}

/*
  This file draws heavily from https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/assets/js/phoenix/presence.js
  License: https://github.com/phoenixframework/phoenix/blob/d344ec0a732ab4ee204215b31de69cf4be72e3bf/LICENSE.md
*/
var REALTIME_PRESENCE_LISTEN_EVENTS;
(function (REALTIME_PRESENCE_LISTEN_EVENTS) {
    REALTIME_PRESENCE_LISTEN_EVENTS["SYNC"] = "sync";
    REALTIME_PRESENCE_LISTEN_EVENTS["JOIN"] = "join";
    REALTIME_PRESENCE_LISTEN_EVENTS["LEAVE"] = "leave";
})(REALTIME_PRESENCE_LISTEN_EVENTS || (REALTIME_PRESENCE_LISTEN_EVENTS = {}));
class RealtimePresence {
    /**
     * Creates a Presence helper that keeps the local presence state in sync with the server.
     *
     * @param channel - The realtime channel to bind to.
     * @param opts - Optional custom event names, e.g. `{ events: { state: 'state', diff: 'diff' } }`.
     *
     * @example
     * ```ts
     * const presence = new RealtimePresence(channel)
     *
     * channel.on('presence', ({ event, key }) => {
     *   console.log(`Presence ${event} on ${key}`)
     * })
     * ```
     */
    constructor(channel, opts) {
        this.channel = channel;
        this.state = {};
        this.pendingDiffs = [];
        this.joinRef = null;
        this.enabled = false;
        this.caller = {
            onJoin: () => { },
            onLeave: () => { },
            onSync: () => { },
        };
        const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
            state: 'presence_state',
            diff: 'presence_diff',
        };
        this.channel._on(events.state, {}, (newState) => {
            const { onJoin, onLeave, onSync } = this.caller;
            this.joinRef = this.channel._joinRef();
            this.state = RealtimePresence.syncState(this.state, newState, onJoin, onLeave);
            this.pendingDiffs.forEach((diff) => {
                this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
            });
            this.pendingDiffs = [];
            onSync();
        });
        this.channel._on(events.diff, {}, (diff) => {
            const { onJoin, onLeave, onSync } = this.caller;
            if (this.inPendingSyncState()) {
                this.pendingDiffs.push(diff);
            }
            else {
                this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
                onSync();
            }
        });
        this.onJoin((key, currentPresences, newPresences) => {
            this.channel._trigger('presence', {
                event: 'join',
                key,
                currentPresences,
                newPresences,
            });
        });
        this.onLeave((key, currentPresences, leftPresences) => {
            this.channel._trigger('presence', {
                event: 'leave',
                key,
                currentPresences,
                leftPresences,
            });
        });
        this.onSync(() => {
            this.channel._trigger('presence', { event: 'sync' });
        });
    }
    /**
     * Used to sync the list of presences on the server with the
     * client's state.
     *
     * An optional `onJoin` and `onLeave` callback can be provided to
     * react to changes in the client's local presences across
     * disconnects and reconnects with the server.
     *
     * @internal
     */
    static syncState(currentState, newState, onJoin, onLeave) {
        const state = this.cloneDeep(currentState);
        const transformedState = this.transformState(newState);
        const joins = {};
        const leaves = {};
        this.map(state, (key, presences) => {
            if (!transformedState[key]) {
                leaves[key] = presences;
            }
        });
        this.map(transformedState, (key, newPresences) => {
            const currentPresences = state[key];
            if (currentPresences) {
                const newPresenceRefs = newPresences.map((m) => m.presence_ref);
                const curPresenceRefs = currentPresences.map((m) => m.presence_ref);
                const joinedPresences = newPresences.filter((m) => curPresenceRefs.indexOf(m.presence_ref) < 0);
                const leftPresences = currentPresences.filter((m) => newPresenceRefs.indexOf(m.presence_ref) < 0);
                if (joinedPresences.length > 0) {
                    joins[key] = joinedPresences;
                }
                if (leftPresences.length > 0) {
                    leaves[key] = leftPresences;
                }
            }
            else {
                joins[key] = newPresences;
            }
        });
        return this.syncDiff(state, { joins, leaves }, onJoin, onLeave);
    }
    /**
     * Used to sync a diff of presence join and leave events from the
     * server, as they happen.
     *
     * Like `syncState`, `syncDiff` accepts optional `onJoin` and
     * `onLeave` callbacks to react to a user joining or leaving from a
     * device.
     *
     * @internal
     */
    static syncDiff(state, diff, onJoin, onLeave) {
        const { joins, leaves } = {
            joins: this.transformState(diff.joins),
            leaves: this.transformState(diff.leaves),
        };
        if (!onJoin) {
            onJoin = () => { };
        }
        if (!onLeave) {
            onLeave = () => { };
        }
        this.map(joins, (key, newPresences) => {
            var _a;
            const currentPresences = (_a = state[key]) !== null && _a !== void 0 ? _a : [];
            state[key] = this.cloneDeep(newPresences);
            if (currentPresences.length > 0) {
                const joinedPresenceRefs = state[key].map((m) => m.presence_ref);
                const curPresences = currentPresences.filter((m) => joinedPresenceRefs.indexOf(m.presence_ref) < 0);
                state[key].unshift(...curPresences);
            }
            onJoin(key, currentPresences, newPresences);
        });
        this.map(leaves, (key, leftPresences) => {
            let currentPresences = state[key];
            if (!currentPresences)
                return;
            const presenceRefsToRemove = leftPresences.map((m) => m.presence_ref);
            currentPresences = currentPresences.filter((m) => presenceRefsToRemove.indexOf(m.presence_ref) < 0);
            state[key] = currentPresences;
            onLeave(key, currentPresences, leftPresences);
            if (currentPresences.length === 0)
                delete state[key];
        });
        return state;
    }
    /** @internal */
    static map(obj, func) {
        return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]));
    }
    /**
     * Remove 'metas' key
     * Change 'phx_ref' to 'presence_ref'
     * Remove 'phx_ref' and 'phx_ref_prev'
     *
     * @example
     * // returns {
     *  abc123: [
     *    { presence_ref: '2', user_id: 1 },
     *    { presence_ref: '3', user_id: 2 }
     *  ]
     * }
     * RealtimePresence.transformState({
     *  abc123: {
     *    metas: [
     *      { phx_ref: '2', phx_ref_prev: '1' user_id: 1 },
     *      { phx_ref: '3', user_id: 2 }
     *    ]
     *  }
     * })
     *
     * @internal
     */
    static transformState(state) {
        state = this.cloneDeep(state);
        return Object.getOwnPropertyNames(state).reduce((newState, key) => {
            const presences = state[key];
            if ('metas' in presences) {
                newState[key] = presences.metas.map((presence) => {
                    presence['presence_ref'] = presence['phx_ref'];
                    delete presence['phx_ref'];
                    delete presence['phx_ref_prev'];
                    return presence;
                });
            }
            else {
                newState[key] = presences;
            }
            return newState;
        }, {});
    }
    /** @internal */
    static cloneDeep(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    /** @internal */
    onJoin(callback) {
        this.caller.onJoin = callback;
    }
    /** @internal */
    onLeave(callback) {
        this.caller.onLeave = callback;
    }
    /** @internal */
    onSync(callback) {
        this.caller.onSync = callback;
    }
    /** @internal */
    inPendingSyncState() {
        return !this.joinRef || this.joinRef !== this.channel._joinRef();
    }
}

var REALTIME_POSTGRES_CHANGES_LISTEN_EVENT;
(function (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT) {
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["ALL"] = "*";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["INSERT"] = "INSERT";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["UPDATE"] = "UPDATE";
    REALTIME_POSTGRES_CHANGES_LISTEN_EVENT["DELETE"] = "DELETE";
})(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT || (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}));
var REALTIME_LISTEN_TYPES;
(function (REALTIME_LISTEN_TYPES) {
    REALTIME_LISTEN_TYPES["BROADCAST"] = "broadcast";
    REALTIME_LISTEN_TYPES["PRESENCE"] = "presence";
    REALTIME_LISTEN_TYPES["POSTGRES_CHANGES"] = "postgres_changes";
    REALTIME_LISTEN_TYPES["SYSTEM"] = "system";
})(REALTIME_LISTEN_TYPES || (REALTIME_LISTEN_TYPES = {}));
var REALTIME_SUBSCRIBE_STATES;
(function (REALTIME_SUBSCRIBE_STATES) {
    REALTIME_SUBSCRIBE_STATES["SUBSCRIBED"] = "SUBSCRIBED";
    REALTIME_SUBSCRIBE_STATES["TIMED_OUT"] = "TIMED_OUT";
    REALTIME_SUBSCRIBE_STATES["CLOSED"] = "CLOSED";
    REALTIME_SUBSCRIBE_STATES["CHANNEL_ERROR"] = "CHANNEL_ERROR";
})(REALTIME_SUBSCRIBE_STATES || (REALTIME_SUBSCRIBE_STATES = {}));
/** A channel is the basic building block of Realtime
 * and narrows the scope of data flow to subscribed clients.
 * You can think of a channel as a chatroom where participants are able to see who's online
 * and send and receive messages.
 */
class RealtimeChannel {
    /**
     * Creates a channel that can broadcast messages, sync presence, and listen to Postgres changes.
     *
     * The topic determines which realtime stream you are subscribing to. Config options let you
     * enable acknowledgement for broadcasts, presence tracking, or private channels.
     *
     * @example
     * ```ts
     * import RealtimeClient from '@supabase/realtime-js'
     *
     * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
     *   params: { apikey: 'public-anon-key' },
     * })
     * const channel = new RealtimeChannel('realtime:public:messages', { config: {} }, client)
     * ```
     */
    constructor(
    /** Topic name can be any string. */
    topic, params = { config: {} }, socket) {
        var _a, _b;
        this.topic = topic;
        this.params = params;
        this.socket = socket;
        this.bindings = {};
        this.state = CHANNEL_STATES.closed;
        this.joinedOnce = false;
        this.pushBuffer = [];
        this.subTopic = topic.replace(/^realtime:/i, '');
        this.params.config = Object.assign({
            broadcast: { ack: false, self: false },
            presence: { key: '', enabled: false },
            private: false,
        }, params.config);
        this.timeout = this.socket.timeout;
        this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
        this.rejoinTimer = new Timer(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
        this.joinPush.receive('ok', () => {
            this.state = CHANNEL_STATES.joined;
            this.rejoinTimer.reset();
            this.pushBuffer.forEach((pushEvent) => pushEvent.send());
            this.pushBuffer = [];
        });
        this._onClose(() => {
            this.rejoinTimer.reset();
            this.socket.log('channel', `close ${this.topic} ${this._joinRef()}`);
            this.state = CHANNEL_STATES.closed;
            this.socket._remove(this);
        });
        this._onError((reason) => {
            if (this._isLeaving() || this._isClosed()) {
                return;
            }
            this.socket.log('channel', `error ${this.topic}`, reason);
            this.state = CHANNEL_STATES.errored;
            this.rejoinTimer.scheduleTimeout();
        });
        this.joinPush.receive('timeout', () => {
            if (!this._isJoining()) {
                return;
            }
            this.socket.log('channel', `timeout ${this.topic}`, this.joinPush.timeout);
            this.state = CHANNEL_STATES.errored;
            this.rejoinTimer.scheduleTimeout();
        });
        this.joinPush.receive('error', (reason) => {
            if (this._isLeaving() || this._isClosed()) {
                return;
            }
            this.socket.log('channel', `error ${this.topic}`, reason);
            this.state = CHANNEL_STATES.errored;
            this.rejoinTimer.scheduleTimeout();
        });
        this._on(CHANNEL_EVENTS.reply, {}, (payload, ref) => {
            this._trigger(this._replyEventName(ref), payload);
        });
        this.presence = new RealtimePresence(this);
        this.broadcastEndpointURL = httpEndpointURL(this.socket.endPoint);
        this.private = this.params.config.private || false;
        if (!this.private && ((_b = (_a = this.params.config) === null || _a === void 0 ? void 0 : _a.broadcast) === null || _b === void 0 ? void 0 : _b.replay)) {
            throw `tried to use replay on public channel '${this.topic}'. It must be a private channel.`;
        }
    }
    /** Subscribe registers your client with the server */
    subscribe(callback, timeout = this.timeout) {
        var _a, _b, _c;
        if (!this.socket.isConnected()) {
            this.socket.connect();
        }
        if (this.state == CHANNEL_STATES.closed) {
            const { config: { broadcast, presence, private: isPrivate }, } = this.params;
            const postgres_changes = (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r) => r.filter)) !== null && _b !== void 0 ? _b : [];
            const presence_enabled = (!!this.bindings[REALTIME_LISTEN_TYPES.PRESENCE] &&
                this.bindings[REALTIME_LISTEN_TYPES.PRESENCE].length > 0) ||
                ((_c = this.params.config.presence) === null || _c === void 0 ? void 0 : _c.enabled) === true;
            const accessTokenPayload = {};
            const config = {
                broadcast,
                presence: Object.assign(Object.assign({}, presence), { enabled: presence_enabled }),
                postgres_changes,
                private: isPrivate,
            };
            if (this.socket.accessTokenValue) {
                accessTokenPayload.access_token = this.socket.accessTokenValue;
            }
            this._onError((e) => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, e));
            this._onClose(() => callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CLOSED));
            this.updateJoinPayload(Object.assign({ config }, accessTokenPayload));
            this.joinedOnce = true;
            this._rejoin(timeout);
            this.joinPush
                .receive('ok', async ({ postgres_changes }) => {
                var _a;
                // Only refresh auth if using callback-based tokens
                if (!this.socket._isManualToken()) {
                    this.socket.setAuth();
                }
                if (postgres_changes === undefined) {
                    callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
                    return;
                }
                else {
                    const clientPostgresBindings = this.bindings.postgres_changes;
                    const bindingsLen = (_a = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a !== void 0 ? _a : 0;
                    const newPostgresBindings = [];
                    for (let i = 0; i < bindingsLen; i++) {
                        const clientPostgresBinding = clientPostgresBindings[i];
                        const { filter: { event, schema, table, filter }, } = clientPostgresBinding;
                        const serverPostgresFilter = postgres_changes && postgres_changes[i];
                        if (serverPostgresFilter &&
                            serverPostgresFilter.event === event &&
                            RealtimeChannel.isFilterValueEqual(serverPostgresFilter.schema, schema) &&
                            RealtimeChannel.isFilterValueEqual(serverPostgresFilter.table, table) &&
                            RealtimeChannel.isFilterValueEqual(serverPostgresFilter.filter, filter)) {
                            newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), { id: serverPostgresFilter.id }));
                        }
                        else {
                            this.unsubscribe();
                            this.state = CHANNEL_STATES.errored;
                            callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error('mismatch between server and client bindings for postgres changes'));
                            return;
                        }
                    }
                    this.bindings.postgres_changes = newPostgresBindings;
                    callback && callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED);
                    return;
                }
            })
                .receive('error', (error) => {
                this.state = CHANNEL_STATES.errored;
                callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error(JSON.stringify(Object.values(error).join(', ') || 'error')));
                return;
            })
                .receive('timeout', () => {
                callback === null || callback === void 0 ? void 0 : callback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT);
                return;
            });
        }
        return this;
    }
    /**
     * Returns the current presence state for this channel.
     *
     * The shape is a map keyed by presence key (for example a user id) where each entry contains the
     * tracked metadata for that user.
     */
    presenceState() {
        return this.presence.state;
    }
    /**
     * Sends the supplied payload to the presence tracker so other subscribers can see that this
     * client is online. Use `untrack` to stop broadcasting presence for the same key.
     */
    async track(payload, opts = {}) {
        return await this.send({
            type: 'presence',
            event: 'track',
            payload,
        }, opts.timeout || this.timeout);
    }
    /**
     * Removes the current presence state for this client.
     */
    async untrack(opts = {}) {
        return await this.send({
            type: 'presence',
            event: 'untrack',
        }, opts);
    }
    on(type, filter, callback) {
        if (this.state === CHANNEL_STATES.joined && type === REALTIME_LISTEN_TYPES.PRESENCE) {
            this.socket.log('channel', `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`);
            this.unsubscribe().then(async () => await this.subscribe());
        }
        return this._on(type, filter, callback);
    }
    /**
     * Sends a broadcast message explicitly via REST API.
     *
     * This method always uses the REST API endpoint regardless of WebSocket connection state.
     * Useful when you want to guarantee REST delivery or when gradually migrating from implicit REST fallback.
     *
     * @param event The name of the broadcast event
     * @param payload Payload to be sent (required)
     * @param opts Options including timeout
     * @returns Promise resolving to object with success status, and error details if failed
     */
    async httpSend(event, payload, opts = {}) {
        var _a;
        if (payload === undefined || payload === null) {
            return Promise.reject('Payload is required for httpSend()');
        }
        const headers = {
            apikey: this.socket.apiKey ? this.socket.apiKey : '',
            'Content-Type': 'application/json',
        };
        if (this.socket.accessTokenValue) {
            headers['Authorization'] = `Bearer ${this.socket.accessTokenValue}`;
        }
        const options = {
            method: 'POST',
            headers,
            body: JSON.stringify({
                messages: [
                    {
                        topic: this.subTopic,
                        event,
                        payload: payload,
                        private: this.private,
                    },
                ],
            }),
        };
        const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
        if (response.status === 202) {
            return { success: true };
        }
        let errorMessage = response.statusText;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody.error || errorBody.message || errorMessage;
        }
        catch (_b) { }
        return Promise.reject(new Error(errorMessage));
    }
    /**
     * Sends a message into the channel.
     *
     * @param args Arguments to send to channel
     * @param args.type The type of event to send
     * @param args.event The name of the event being sent
     * @param args.payload Payload to be sent
     * @param opts Options to be used during the send process
     */
    async send(args, opts = {}) {
        var _a, _b;
        if (!this._canPush() && args.type === 'broadcast') {
            console.warn('Realtime send() is automatically falling back to REST API. ' +
                'This behavior will be deprecated in the future. ' +
                'Please use httpSend() explicitly for REST delivery.');
            const { event, payload: endpoint_payload } = args;
            const headers = {
                apikey: this.socket.apiKey ? this.socket.apiKey : '',
                'Content-Type': 'application/json',
            };
            if (this.socket.accessTokenValue) {
                headers['Authorization'] = `Bearer ${this.socket.accessTokenValue}`;
            }
            const options = {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    messages: [
                        {
                            topic: this.subTopic,
                            event,
                            payload: endpoint_payload,
                            private: this.private,
                        },
                    ],
                }),
            };
            try {
                const response = await this._fetchWithTimeout(this.broadcastEndpointURL, options, (_a = opts.timeout) !== null && _a !== void 0 ? _a : this.timeout);
                await ((_b = response.body) === null || _b === void 0 ? void 0 : _b.cancel());
                return response.ok ? 'ok' : 'error';
            }
            catch (error) {
                if (error.name === 'AbortError') {
                    return 'timed out';
                }
                else {
                    return 'error';
                }
            }
        }
        else {
            return new Promise((resolve) => {
                var _a, _b, _c;
                const push = this._push(args.type, args, opts.timeout || this.timeout);
                if (args.type === 'broadcast' && !((_c = (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
                    resolve('ok');
                }
                push.receive('ok', () => resolve('ok'));
                push.receive('error', () => resolve('error'));
                push.receive('timeout', () => resolve('timed out'));
            });
        }
    }
    /**
     * Updates the payload that will be sent the next time the channel joins (reconnects).
     * Useful for rotating access tokens or updating config without re-creating the channel.
     */
    updateJoinPayload(payload) {
        this.joinPush.updatePayload(payload);
    }
    /**
     * Leaves the channel.
     *
     * Unsubscribes from server events, and instructs channel to terminate on server.
     * Triggers onClose() hooks.
     *
     * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
     * channel.unsubscribe().receive("ok", () => alert("left!") )
     */
    unsubscribe(timeout = this.timeout) {
        this.state = CHANNEL_STATES.leaving;
        const onClose = () => {
            this.socket.log('channel', `leave ${this.topic}`);
            this._trigger(CHANNEL_EVENTS.close, 'leave', this._joinRef());
        };
        this.joinPush.destroy();
        let leavePush = null;
        return new Promise((resolve) => {
            leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
            leavePush
                .receive('ok', () => {
                onClose();
                resolve('ok');
            })
                .receive('timeout', () => {
                onClose();
                resolve('timed out');
            })
                .receive('error', () => {
                resolve('error');
            });
            leavePush.send();
            if (!this._canPush()) {
                leavePush.trigger('ok', {});
            }
        }).finally(() => {
            leavePush === null || leavePush === void 0 ? void 0 : leavePush.destroy();
        });
    }
    /**
     * Teardown the channel.
     *
     * Destroys and stops related timers.
     */
    teardown() {
        this.pushBuffer.forEach((push) => push.destroy());
        this.pushBuffer = [];
        this.rejoinTimer.reset();
        this.joinPush.destroy();
        this.state = CHANNEL_STATES.closed;
        this.bindings = {};
    }
    /** @internal */
    async _fetchWithTimeout(url, options, timeout) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await this.socket.fetch(url, Object.assign(Object.assign({}, options), { signal: controller.signal }));
        clearTimeout(id);
        return response;
    }
    /** @internal */
    _push(event, payload, timeout = this.timeout) {
        if (!this.joinedOnce) {
            throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
        }
        let pushEvent = new Push(this, event, payload, timeout);
        if (this._canPush()) {
            pushEvent.send();
        }
        else {
            this._addToPushBuffer(pushEvent);
        }
        return pushEvent;
    }
    /** @internal */
    _addToPushBuffer(pushEvent) {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
        // Enforce buffer size limit
        if (this.pushBuffer.length > MAX_PUSH_BUFFER_SIZE) {
            const removedPush = this.pushBuffer.shift();
            if (removedPush) {
                removedPush.destroy();
                this.socket.log('channel', `discarded push due to buffer overflow: ${removedPush.event}`, removedPush.payload);
            }
        }
    }
    /**
     * Overridable message hook
     *
     * Receives all events for specialized message handling before dispatching to the channel callbacks.
     * Must return the payload, modified or unmodified.
     *
     * @internal
     */
    _onMessage(_event, payload, _ref) {
        return payload;
    }
    /** @internal */
    _isMember(topic) {
        return this.topic === topic;
    }
    /** @internal */
    _joinRef() {
        return this.joinPush.ref;
    }
    /** @internal */
    _trigger(type, payload, ref) {
        var _a, _b;
        const typeLower = type.toLocaleLowerCase();
        const { close, error, leave, join } = CHANNEL_EVENTS;
        const events = [close, error, leave, join];
        if (ref && events.indexOf(typeLower) >= 0 && ref !== this._joinRef()) {
            return;
        }
        let handledPayload = this._onMessage(typeLower, payload, ref);
        if (payload && !handledPayload) {
            throw 'channel onMessage callbacks must return the payload, modified or unmodified';
        }
        if (['insert', 'update', 'delete'].includes(typeLower)) {
            (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.filter((bind) => {
                var _a, _b, _c;
                return ((_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event) === '*' || ((_c = (_b = bind.filter) === null || _b === void 0 ? void 0 : _b.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower;
            }).map((bind) => bind.callback(handledPayload, ref));
        }
        else {
            (_b = this.bindings[typeLower]) === null || _b === void 0 ? void 0 : _b.filter((bind) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                if (['broadcast', 'presence', 'postgres_changes'].includes(typeLower)) {
                    if ('id' in bind) {
                        const bindId = bind.id;
                        const bindEvent = (_a = bind.filter) === null || _a === void 0 ? void 0 : _a.event;
                        return (bindId &&
                            ((_b = payload.ids) === null || _b === void 0 ? void 0 : _b.includes(bindId)) &&
                            (bindEvent === '*' ||
                                (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) === ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase())) &&
                            (!((_d = bind.filter) === null || _d === void 0 ? void 0 : _d.table) || bind.filter.table === ((_e = payload.data) === null || _e === void 0 ? void 0 : _e.table)));
                    }
                    else {
                        const bindEvent = (_g = (_f = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _f === void 0 ? void 0 : _f.event) === null || _g === void 0 ? void 0 : _g.toLocaleLowerCase();
                        return bindEvent === '*' || bindEvent === ((_h = payload === null || payload === void 0 ? void 0 : payload.event) === null || _h === void 0 ? void 0 : _h.toLocaleLowerCase());
                    }
                }
                else {
                    return bind.type.toLocaleLowerCase() === typeLower;
                }
            }).map((bind) => {
                if (typeof handledPayload === 'object' && 'ids' in handledPayload) {
                    const postgresChanges = handledPayload.data;
                    const { schema, table, commit_timestamp, type, errors } = postgresChanges;
                    const enrichedPayload = {
                        schema: schema,
                        table: table,
                        commit_timestamp: commit_timestamp,
                        eventType: type,
                        new: {},
                        old: {},
                        errors: errors,
                    };
                    handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
                }
                bind.callback(handledPayload, ref);
            });
        }
    }
    /** @internal */
    _isClosed() {
        return this.state === CHANNEL_STATES.closed;
    }
    /** @internal */
    _isJoined() {
        return this.state === CHANNEL_STATES.joined;
    }
    /** @internal */
    _isJoining() {
        return this.state === CHANNEL_STATES.joining;
    }
    /** @internal */
    _isLeaving() {
        return this.state === CHANNEL_STATES.leaving;
    }
    /** @internal */
    _replyEventName(ref) {
        return `chan_reply_${ref}`;
    }
    /** @internal */
    _on(type, filter, callback) {
        const typeLower = type.toLocaleLowerCase();
        const binding = {
            type: typeLower,
            filter: filter,
            callback: callback,
        };
        if (this.bindings[typeLower]) {
            this.bindings[typeLower].push(binding);
        }
        else {
            this.bindings[typeLower] = [binding];
        }
        return this;
    }
    /** @internal */
    _off(type, filter) {
        const typeLower = type.toLocaleLowerCase();
        if (this.bindings[typeLower]) {
            this.bindings[typeLower] = this.bindings[typeLower].filter((bind) => {
                var _a;
                return !(((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === typeLower &&
                    RealtimeChannel.isEqual(bind.filter, filter));
            });
        }
        return this;
    }
    /** @internal */
    static isEqual(obj1, obj2) {
        if (Object.keys(obj1).length !== Object.keys(obj2).length) {
            return false;
        }
        for (const k in obj1) {
            if (obj1[k] !== obj2[k]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Compares two optional filter values for equality.
     * Treats undefined, null, and empty string as equivalent empty values.
     * @internal
     */
    static isFilterValueEqual(serverValue, clientValue) {
        const normalizedServer = serverValue !== null && serverValue !== void 0 ? serverValue : undefined;
        const normalizedClient = clientValue !== null && clientValue !== void 0 ? clientValue : undefined;
        return normalizedServer === normalizedClient;
    }
    /** @internal */
    _rejoinUntilConnected() {
        this.rejoinTimer.scheduleTimeout();
        if (this.socket.isConnected()) {
            this._rejoin();
        }
    }
    /**
     * Registers a callback that will be executed when the channel closes.
     *
     * @internal
     */
    _onClose(callback) {
        this._on(CHANNEL_EVENTS.close, {}, callback);
    }
    /**
     * Registers a callback that will be executed when the channel encounteres an error.
     *
     * @internal
     */
    _onError(callback) {
        this._on(CHANNEL_EVENTS.error, {}, (reason) => callback(reason));
    }
    /**
     * Returns `true` if the socket is connected and the channel has been joined.
     *
     * @internal
     */
    _canPush() {
        return this.socket.isConnected() && this._isJoined();
    }
    /** @internal */
    _rejoin(timeout = this.timeout) {
        if (this._isLeaving()) {
            return;
        }
        this.socket._leaveOpenTopic(this.topic);
        this.state = CHANNEL_STATES.joining;
        this.joinPush.resend(timeout);
    }
    /** @internal */
    _getPayloadRecords(payload) {
        const records = {
            new: {},
            old: {},
        };
        if (payload.type === 'INSERT' || payload.type === 'UPDATE') {
            records.new = convertChangeData(payload.columns, payload.record);
        }
        if (payload.type === 'UPDATE' || payload.type === 'DELETE') {
            records.old = convertChangeData(payload.columns, payload.old_record);
        }
        return records;
    }
}

const noop = () => { };
// Connection-related constants
const CONNECTION_TIMEOUTS = {
    HEARTBEAT_INTERVAL: 25000,
    RECONNECT_DELAY: 10,
    HEARTBEAT_TIMEOUT_FALLBACK: 100,
};
const RECONNECT_INTERVALS = [1000, 2000, 5000, 10000];
const DEFAULT_RECONNECT_FALLBACK = 10000;
const WORKER_SCRIPT = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
class RealtimeClient {
    /**
     * Initializes the Socket.
     *
     * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
     * @param httpEndpoint The string HTTP endpoint, ie, "https://example.com", "/" (inherited host & protocol)
     * @param options.transport The Websocket Transport, for example WebSocket. This can be a custom implementation
     * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
     * @param options.params The optional params to pass when connecting.
     * @param options.headers Deprecated: headers cannot be set on websocket connections and this option will be removed in the future.
     * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
     * @param options.heartbeatCallback The optional function to handle heartbeat status and latency.
     * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
     * @param options.logLevel Sets the log level for Realtime
     * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
     * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
     * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
     * @param options.worker Use Web Worker to set a side flow. Defaults to false.
     * @param options.workerUrl The URL of the worker script. Defaults to https://realtime.supabase.com/worker.js that includes a heartbeat event call to keep the connection alive.
     * @param options.vsn The protocol version to use when connecting. Supported versions are "1.0.0" and "2.0.0". Defaults to "2.0.0".
     * @example
     * ```ts
     * import RealtimeClient from '@supabase/realtime-js'
     *
     * const client = new RealtimeClient('https://xyzcompany.supabase.co/realtime/v1', {
     *   params: { apikey: 'public-anon-key' },
     * })
     * client.connect()
     * ```
     */
    constructor(endPoint, options) {
        var _a;
        this.accessTokenValue = null;
        this.apiKey = null;
        this._manuallySetToken = false;
        this.channels = new Array();
        this.endPoint = '';
        this.httpEndpoint = '';
        /** @deprecated headers cannot be set on websocket connections */
        this.headers = {};
        this.params = {};
        this.timeout = DEFAULT_TIMEOUT;
        this.transport = null;
        this.heartbeatIntervalMs = CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
        this.heartbeatTimer = undefined;
        this.pendingHeartbeatRef = null;
        this.heartbeatCallback = noop;
        this.ref = 0;
        this.reconnectTimer = null;
        this.vsn = DEFAULT_VSN;
        this.logger = noop;
        this.conn = null;
        this.sendBuffer = [];
        this.serializer = new Serializer();
        this.stateChangeCallbacks = {
            open: [],
            close: [],
            error: [],
            message: [],
        };
        this.accessToken = null;
        this._connectionState = 'disconnected';
        this._wasManualDisconnect = false;
        this._authPromise = null;
        this._heartbeatSentAt = null;
        /**
         * Use either custom fetch, if provided, or default fetch to make HTTP requests
         *
         * @internal
         */
        this._resolveFetch = (customFetch) => {
            if (customFetch) {
                return (...args) => customFetch(...args);
            }
            return (...args) => fetch(...args);
        };
        // Validate required parameters
        if (!((_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.apikey)) {
            throw new Error('API key is required to connect to Realtime');
        }
        this.apiKey = options.params.apikey;
        // Initialize endpoint URLs
        this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
        this.httpEndpoint = httpEndpointURL(endPoint);
        this._initializeOptions(options);
        this._setupReconnectionTimer();
        this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
    }
    /**
     * Connects the socket, unless already connected.
     */
    connect() {
        // Skip if already connecting, disconnecting, or connected
        if (this.isConnecting() ||
            this.isDisconnecting() ||
            (this.conn !== null && this.isConnected())) {
            return;
        }
        this._setConnectionState('connecting');
        // Trigger auth if needed and not already in progress
        // This ensures auth is called for standalone RealtimeClient usage
        // while avoiding race conditions with SupabaseClient's immediate setAuth call
        if (this.accessToken && !this._authPromise) {
            this._setAuthSafely('connect');
        }
        // Establish WebSocket connection
        if (this.transport) {
            // Use custom transport if provided
            this.conn = new this.transport(this.endpointURL());
        }
        else {
            // Try to use native WebSocket
            try {
                this.conn = WebSocketFactory.createWebSocket(this.endpointURL());
            }
            catch (error) {
                this._setConnectionState('disconnected');
                const errorMessage = error.message;
                // Provide helpful error message based on environment
                if (errorMessage.includes('Node.js')) {
                    throw new Error(`${errorMessage}\n\n` +
                        'To use Realtime in Node.js, you need to provide a WebSocket implementation:\n\n' +
                        'Option 1: Use Node.js 22+ which has native WebSocket support\n' +
                        'Option 2: Install and provide the "ws" package:\n\n' +
                        '  npm install ws\n\n' +
                        '  import ws from "ws"\n' +
                        '  const client = new RealtimeClient(url, {\n' +
                        '    ...options,\n' +
                        '    transport: ws\n' +
                        '  })');
                }
                throw new Error(`WebSocket not available: ${errorMessage}`);
            }
        }
        this._setupConnectionHandlers();
    }
    /**
     * Returns the URL of the websocket.
     * @returns string The URL of the websocket.
     */
    endpointURL() {
        return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: this.vsn }));
    }
    /**
     * Disconnects the socket.
     *
     * @param code A numeric status code to send on disconnect.
     * @param reason A custom reason for the disconnect.
     */
    disconnect(code, reason) {
        if (this.isDisconnecting()) {
            return;
        }
        this._setConnectionState('disconnecting', true);
        if (this.conn) {
            // Setup fallback timer to prevent hanging in disconnecting state
            const fallbackTimer = setTimeout(() => {
                this._setConnectionState('disconnected');
            }, 100);
            this.conn.onclose = () => {
                clearTimeout(fallbackTimer);
                this._setConnectionState('disconnected');
            };
            // Close the WebSocket connection if close method exists
            if (typeof this.conn.close === 'function') {
                if (code) {
                    this.conn.close(code, reason !== null && reason !== void 0 ? reason : '');
                }
                else {
                    this.conn.close();
                }
            }
            this._teardownConnection();
        }
        else {
            this._setConnectionState('disconnected');
        }
    }
    /**
     * Returns all created channels
     */
    getChannels() {
        return this.channels;
    }
    /**
     * Unsubscribes and removes a single channel
     * @param channel A RealtimeChannel instance
     */
    async removeChannel(channel) {
        const status = await channel.unsubscribe();
        if (this.channels.length === 0) {
            this.disconnect();
        }
        return status;
    }
    /**
     * Unsubscribes and removes all channels
     */
    async removeAllChannels() {
        const values_1 = await Promise.all(this.channels.map((channel) => channel.unsubscribe()));
        this.channels = [];
        this.disconnect();
        return values_1;
    }
    /**
     * Logs the message.
     *
     * For customized logging, `this.logger` can be overridden.
     */
    log(kind, msg, data) {
        this.logger(kind, msg, data);
    }
    /**
     * Returns the current state of the socket.
     */
    connectionState() {
        switch (this.conn && this.conn.readyState) {
            case SOCKET_STATES.connecting:
                return CONNECTION_STATE.Connecting;
            case SOCKET_STATES.open:
                return CONNECTION_STATE.Open;
            case SOCKET_STATES.closing:
                return CONNECTION_STATE.Closing;
            default:
                return CONNECTION_STATE.Closed;
        }
    }
    /**
     * Returns `true` is the connection is open.
     */
    isConnected() {
        return this.connectionState() === CONNECTION_STATE.Open;
    }
    /**
     * Returns `true` if the connection is currently connecting.
     */
    isConnecting() {
        return this._connectionState === 'connecting';
    }
    /**
     * Returns `true` if the connection is currently disconnecting.
     */
    isDisconnecting() {
        return this._connectionState === 'disconnecting';
    }
    /**
     * Creates (or reuses) a {@link RealtimeChannel} for the provided topic.
     *
     * Topics are automatically prefixed with `realtime:` to match the Realtime service.
     * If a channel with the same topic already exists it will be returned instead of creating
     * a duplicate connection.
     */
    channel(topic, params = { config: {} }) {
        const realtimeTopic = `realtime:${topic}`;
        const exists = this.getChannels().find((c) => c.topic === realtimeTopic);
        if (!exists) {
            const chan = new RealtimeChannel(`realtime:${topic}`, params, this);
            this.channels.push(chan);
            return chan;
        }
        else {
            return exists;
        }
    }
    /**
     * Push out a message if the socket is connected.
     *
     * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
     */
    push(data) {
        const { topic, event, payload, ref } = data;
        const callback = () => {
            this.encode(data, (result) => {
                var _a;
                (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
            });
        };
        this.log('push', `${topic} ${event} (${ref})`, payload);
        if (this.isConnected()) {
            callback();
        }
        else {
            this.sendBuffer.push(callback);
        }
    }
    /**
     * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
     *
     * If param is null it will use the `accessToken` callback function or the token set on the client.
     *
     * On callback used, it will set the value of the token internal to the client.
     *
     * When a token is explicitly provided, it will be preserved across channel operations
     * (including removeChannel and resubscribe). The `accessToken` callback will not be
     * invoked until `setAuth()` is called without arguments.
     *
     * @param token A JWT string to override the token set on the client.
     *
     * @example
     * // Use a manual token (preserved across resubscribes, ignores accessToken callback)
     * client.realtime.setAuth('my-custom-jwt')
     *
     * // Switch back to using the accessToken callback
     * client.realtime.setAuth()
     */
    async setAuth(token = null) {
        this._authPromise = this._performAuth(token);
        try {
            await this._authPromise;
        }
        finally {
            this._authPromise = null;
        }
    }
    /**
     * Returns true if the current access token was explicitly set via setAuth(token),
     * false if it was obtained via the accessToken callback.
     * @internal
     */
    _isManualToken() {
        return this._manuallySetToken;
    }
    /**
     * Sends a heartbeat message if the socket is connected.
     */
    async sendHeartbeat() {
        var _a;
        if (!this.isConnected()) {
            try {
                this.heartbeatCallback('disconnected');
            }
            catch (e) {
                this.log('error', 'error in heartbeat callback', e);
            }
            return;
        }
        // Handle heartbeat timeout and force reconnection if needed
        if (this.pendingHeartbeatRef) {
            this.pendingHeartbeatRef = null;
            this._heartbeatSentAt = null;
            this.log('transport', 'heartbeat timeout. Attempting to re-establish connection');
            try {
                this.heartbeatCallback('timeout');
            }
            catch (e) {
                this.log('error', 'error in heartbeat callback', e);
            }
            // Force reconnection after heartbeat timeout
            this._wasManualDisconnect = false;
            (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(WS_CLOSE_NORMAL, 'heartbeat timeout');
            setTimeout(() => {
                var _a;
                if (!this.isConnected()) {
                    (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.scheduleTimeout();
                }
            }, CONNECTION_TIMEOUTS.HEARTBEAT_TIMEOUT_FALLBACK);
            return;
        }
        // Send heartbeat message to server
        this._heartbeatSentAt = Date.now();
        this.pendingHeartbeatRef = this._makeRef();
        this.push({
            topic: 'phoenix',
            event: 'heartbeat',
            payload: {},
            ref: this.pendingHeartbeatRef,
        });
        try {
            this.heartbeatCallback('sent');
        }
        catch (e) {
            this.log('error', 'error in heartbeat callback', e);
        }
        this._setAuthSafely('heartbeat');
    }
    /**
     * Sets a callback that receives lifecycle events for internal heartbeat messages.
     * Useful for instrumenting connection health (e.g. sent/ok/timeout/disconnected).
     */
    onHeartbeat(callback) {
        this.heartbeatCallback = callback;
    }
    /**
     * Flushes send buffer
     */
    flushSendBuffer() {
        if (this.isConnected() && this.sendBuffer.length > 0) {
            this.sendBuffer.forEach((callback) => callback());
            this.sendBuffer = [];
        }
    }
    /**
     * Return the next message ref, accounting for overflows
     *
     * @internal
     */
    _makeRef() {
        let newRef = this.ref + 1;
        if (newRef === this.ref) {
            this.ref = 0;
        }
        else {
            this.ref = newRef;
        }
        return this.ref.toString();
    }
    /**
     * Unsubscribe from channels with the specified topic.
     *
     * @internal
     */
    _leaveOpenTopic(topic) {
        let dupChannel = this.channels.find((c) => c.topic === topic && (c._isJoined() || c._isJoining()));
        if (dupChannel) {
            this.log('transport', `leaving duplicate topic "${topic}"`);
            dupChannel.unsubscribe();
        }
    }
    /**
     * Removes a subscription from the socket.
     *
     * @param channel An open subscription.
     *
     * @internal
     */
    _remove(channel) {
        this.channels = this.channels.filter((c) => c.topic !== channel.topic);
    }
    /** @internal */
    _onConnMessage(rawMessage) {
        this.decode(rawMessage.data, (msg) => {
            // Handle heartbeat responses
            if (msg.topic === 'phoenix' &&
                msg.event === 'phx_reply' &&
                msg.ref &&
                msg.ref === this.pendingHeartbeatRef) {
                const latency = this._heartbeatSentAt ? Date.now() - this._heartbeatSentAt : undefined;
                try {
                    this.heartbeatCallback(msg.payload.status === 'ok' ? 'ok' : 'error', latency);
                }
                catch (e) {
                    this.log('error', 'error in heartbeat callback', e);
                }
                this._heartbeatSentAt = null;
                this.pendingHeartbeatRef = null;
            }
            // Log incoming message
            const { topic, event, payload, ref } = msg;
            const refString = ref ? `(${ref})` : '';
            const status = payload.status || '';
            this.log('receive', `${status} ${topic} ${event} ${refString}`.trim(), payload);
            // Route message to appropriate channels
            this.channels
                .filter((channel) => channel._isMember(topic))
                .forEach((channel) => channel._trigger(event, payload, ref));
            this._triggerStateCallbacks('message', msg);
        });
    }
    /**
     * Clear specific timer
     * @internal
     */
    _clearTimer(timer) {
        var _a;
        if (timer === 'heartbeat' && this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        }
        else if (timer === 'reconnect') {
            (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.reset();
        }
    }
    /**
     * Clear all timers
     * @internal
     */
    _clearAllTimers() {
        this._clearTimer('heartbeat');
        this._clearTimer('reconnect');
    }
    /**
     * Setup connection handlers for WebSocket events
     * @internal
     */
    _setupConnectionHandlers() {
        if (!this.conn)
            return;
        // Set binary type if supported (browsers and most WebSocket implementations)
        if ('binaryType' in this.conn) {
            this.conn.binaryType = 'arraybuffer';
        }
        this.conn.onopen = () => this._onConnOpen();
        this.conn.onerror = (error) => this._onConnError(error);
        this.conn.onmessage = (event) => this._onConnMessage(event);
        this.conn.onclose = (event) => this._onConnClose(event);
        if (this.conn.readyState === SOCKET_STATES.open) {
            this._onConnOpen();
        }
    }
    /**
     * Teardown connection and cleanup resources
     * @internal
     */
    _teardownConnection() {
        if (this.conn) {
            if (this.conn.readyState === SOCKET_STATES.open ||
                this.conn.readyState === SOCKET_STATES.connecting) {
                try {
                    this.conn.close();
                }
                catch (e) {
                    this.log('error', 'Error closing connection', e);
                }
            }
            this.conn.onopen = null;
            this.conn.onerror = null;
            this.conn.onmessage = null;
            this.conn.onclose = null;
            this.conn = null;
        }
        this._clearAllTimers();
        this._terminateWorker();
        this.channels.forEach((channel) => channel.teardown());
    }
    /** @internal */
    _onConnOpen() {
        this._setConnectionState('connected');
        this.log('transport', `connected to ${this.endpointURL()}`);
        // Wait for any pending auth operations before flushing send buffer
        // This ensures channel join messages include the correct access token
        const authPromise = this._authPromise ||
            (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve());
        authPromise
            .then(() => {
            this.flushSendBuffer();
        })
            .catch((e) => {
            this.log('error', 'error waiting for auth on connect', e);
            // Proceed anyway to avoid hanging connections
            this.flushSendBuffer();
        });
        this._clearTimer('reconnect');
        if (!this.worker) {
            this._startHeartbeat();
        }
        else {
            if (!this.workerRef) {
                this._startWorkerHeartbeat();
            }
        }
        this._triggerStateCallbacks('open');
    }
    /** @internal */
    _startHeartbeat() {
        this.heartbeatTimer && clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
    }
    /** @internal */
    _startWorkerHeartbeat() {
        if (this.workerUrl) {
            this.log('worker', `starting worker for from ${this.workerUrl}`);
        }
        else {
            this.log('worker', `starting default worker`);
        }
        const objectUrl = this._workerObjectUrl(this.workerUrl);
        this.workerRef = new Worker(objectUrl);
        this.workerRef.onerror = (error) => {
            this.log('worker', 'worker error', error.message);
            this._terminateWorker();
        };
        this.workerRef.onmessage = (event) => {
            if (event.data.event === 'keepAlive') {
                this.sendHeartbeat();
            }
        };
        this.workerRef.postMessage({
            event: 'start',
            interval: this.heartbeatIntervalMs,
        });
    }
    /**
     * Terminate the Web Worker and clear the reference
     * @internal
     */
    _terminateWorker() {
        if (this.workerRef) {
            this.log('worker', 'terminating worker');
            this.workerRef.terminate();
            this.workerRef = undefined;
        }
    }
    /** @internal */
    _onConnClose(event) {
        var _a;
        this._setConnectionState('disconnected');
        this.log('transport', 'close', event);
        this._triggerChanError();
        this._clearTimer('heartbeat');
        // Only schedule reconnection if it wasn't a manual disconnect
        if (!this._wasManualDisconnect) {
            (_a = this.reconnectTimer) === null || _a === void 0 ? void 0 : _a.scheduleTimeout();
        }
        this._triggerStateCallbacks('close', event);
    }
    /** @internal */
    _onConnError(error) {
        this._setConnectionState('disconnected');
        this.log('transport', `${error}`);
        this._triggerChanError();
        this._triggerStateCallbacks('error', error);
    }
    /** @internal */
    _triggerChanError() {
        this.channels.forEach((channel) => channel._trigger(CHANNEL_EVENTS.error));
    }
    /** @internal */
    _appendParams(url, params) {
        if (Object.keys(params).length === 0) {
            return url;
        }
        const prefix = url.match(/\?/) ? '&' : '?';
        const query = new URLSearchParams(params);
        return `${url}${prefix}${query}`;
    }
    _workerObjectUrl(url) {
        let result_url;
        if (url) {
            result_url = url;
        }
        else {
            const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
            result_url = URL.createObjectURL(blob);
        }
        return result_url;
    }
    /**
     * Set connection state with proper state management
     * @internal
     */
    _setConnectionState(state, manual = false) {
        this._connectionState = state;
        if (state === 'connecting') {
            this._wasManualDisconnect = false;
        }
        else if (state === 'disconnecting') {
            this._wasManualDisconnect = manual;
        }
    }
    /**
     * Perform the actual auth operation
     * @internal
     */
    async _performAuth(token = null) {
        let tokenToSend;
        let isManualToken = false;
        if (token) {
            tokenToSend = token;
            // Track if this is a manually-provided token
            isManualToken = true;
        }
        else if (this.accessToken) {
            // Call the accessToken callback to get fresh token
            try {
                tokenToSend = await this.accessToken();
            }
            catch (e) {
                this.log('error', 'Error fetching access token from callback', e);
                // Fall back to cached value if callback fails
                tokenToSend = this.accessTokenValue;
            }
        }
        else {
            tokenToSend = this.accessTokenValue;
        }
        // Track whether this token was manually set or fetched via callback
        if (isManualToken) {
            this._manuallySetToken = true;
        }
        else if (this.accessToken) {
            // If we used the callback, clear the manual flag
            this._manuallySetToken = false;
        }
        if (this.accessTokenValue != tokenToSend) {
            this.accessTokenValue = tokenToSend;
            this.channels.forEach((channel) => {
                const payload = {
                    access_token: tokenToSend,
                    version: DEFAULT_VERSION,
                };
                tokenToSend && channel.updateJoinPayload(payload);
                if (channel.joinedOnce && channel._isJoined()) {
                    channel._push(CHANNEL_EVENTS.access_token, {
                        access_token: tokenToSend,
                    });
                }
            });
        }
    }
    /**
     * Wait for any in-flight auth operations to complete
     * @internal
     */
    async _waitForAuthIfNeeded() {
        if (this._authPromise) {
            await this._authPromise;
        }
    }
    /**
     * Safely call setAuth with standardized error handling
     * @internal
     */
    _setAuthSafely(context = 'general') {
        // Only refresh auth if using callback-based tokens
        if (!this._isManualToken()) {
            this.setAuth().catch((e) => {
                this.log('error', `Error setting auth in ${context}`, e);
            });
        }
    }
    /**
     * Trigger state change callbacks with proper error handling
     * @internal
     */
    _triggerStateCallbacks(event, data) {
        try {
            this.stateChangeCallbacks[event].forEach((callback) => {
                try {
                    callback(data);
                }
                catch (e) {
                    this.log('error', `error in ${event} callback`, e);
                }
            });
        }
        catch (e) {
            this.log('error', `error triggering ${event} callbacks`, e);
        }
    }
    /**
     * Setup reconnection timer with proper configuration
     * @internal
     */
    _setupReconnectionTimer() {
        this.reconnectTimer = new Timer(async () => {
            setTimeout(async () => {
                await this._waitForAuthIfNeeded();
                if (!this.isConnected()) {
                    this.connect();
                }
            }, CONNECTION_TIMEOUTS.RECONNECT_DELAY);
        }, this.reconnectAfterMs);
    }
    /**
     * Initialize client options with defaults
     * @internal
     */
    _initializeOptions(options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        // Set defaults
        this.transport = (_a = options === null || options === void 0 ? void 0 : options.transport) !== null && _a !== void 0 ? _a : null;
        this.timeout = (_b = options === null || options === void 0 ? void 0 : options.timeout) !== null && _b !== void 0 ? _b : DEFAULT_TIMEOUT;
        this.heartbeatIntervalMs =
            (_c = options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs) !== null && _c !== void 0 ? _c : CONNECTION_TIMEOUTS.HEARTBEAT_INTERVAL;
        this.worker = (_d = options === null || options === void 0 ? void 0 : options.worker) !== null && _d !== void 0 ? _d : false;
        this.accessToken = (_e = options === null || options === void 0 ? void 0 : options.accessToken) !== null && _e !== void 0 ? _e : null;
        this.heartbeatCallback = (_f = options === null || options === void 0 ? void 0 : options.heartbeatCallback) !== null && _f !== void 0 ? _f : noop;
        this.vsn = (_g = options === null || options === void 0 ? void 0 : options.vsn) !== null && _g !== void 0 ? _g : DEFAULT_VSN;
        // Handle special cases
        if (options === null || options === void 0 ? void 0 : options.params)
            this.params = options.params;
        if (options === null || options === void 0 ? void 0 : options.logger)
            this.logger = options.logger;
        if ((options === null || options === void 0 ? void 0 : options.logLevel) || (options === null || options === void 0 ? void 0 : options.log_level)) {
            this.logLevel = options.logLevel || options.log_level;
            this.params = Object.assign(Object.assign({}, this.params), { log_level: this.logLevel });
        }
        // Set up functions with defaults
        this.reconnectAfterMs =
            (_h = options === null || options === void 0 ? void 0 : options.reconnectAfterMs) !== null && _h !== void 0 ? _h : ((tries) => {
                return RECONNECT_INTERVALS[tries - 1] || DEFAULT_RECONNECT_FALLBACK;
            });
        switch (this.vsn) {
            case VSN_1_0_0:
                this.encode =
                    (_j = options === null || options === void 0 ? void 0 : options.encode) !== null && _j !== void 0 ? _j : ((payload, callback) => {
                        return callback(JSON.stringify(payload));
                    });
                this.decode =
                    (_k = options === null || options === void 0 ? void 0 : options.decode) !== null && _k !== void 0 ? _k : ((payload, callback) => {
                        return callback(JSON.parse(payload));
                    });
                break;
            case VSN_2_0_0:
                this.encode = (_l = options === null || options === void 0 ? void 0 : options.encode) !== null && _l !== void 0 ? _l : this.serializer.encode.bind(this.serializer);
                this.decode = (_m = options === null || options === void 0 ? void 0 : options.decode) !== null && _m !== void 0 ? _m : this.serializer.decode.bind(this.serializer);
                break;
            default:
                throw new Error(`Unsupported serializer version: ${this.vsn}`);
        }
        // Handle worker setup
        if (this.worker) {
            if (typeof window !== 'undefined' && !window.Worker) {
                throw new Error('Web Worker is not supported');
            }
            this.workerUrl = options === null || options === void 0 ? void 0 : options.workerUrl;
        }
    }
}

// src/errors/IcebergError.ts
var IcebergError = class extends Error {
  constructor(message, opts) {
    super(message);
    this.name = "IcebergError";
    this.status = opts.status;
    this.icebergType = opts.icebergType;
    this.icebergCode = opts.icebergCode;
    this.details = opts.details;
    this.isCommitStateUnknown = opts.icebergType === "CommitStateUnknownException" || [500, 502, 504].includes(opts.status) && opts.icebergType?.includes("CommitState") === true;
  }
  /**
   * Returns true if the error is a 404 Not Found error.
   */
  isNotFound() {
    return this.status === 404;
  }
  /**
   * Returns true if the error is a 409 Conflict error.
   */
  isConflict() {
    return this.status === 409;
  }
  /**
   * Returns true if the error is a 419 Authentication Timeout error.
   */
  isAuthenticationTimeout() {
    return this.status === 419;
  }
};

// src/utils/url.ts
function buildUrl(baseUrl, path, query) {
  const url = new URL(path, baseUrl);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== void 0) {
        url.searchParams.set(key, value);
      }
    }
  }
  return url.toString();
}

// src/http/createFetchClient.ts
async function buildAuthHeaders(auth) {
  if (!auth || auth.type === "none") {
    return {};
  }
  if (auth.type === "bearer") {
    return { Authorization: `Bearer ${auth.token}` };
  }
  if (auth.type === "header") {
    return { [auth.name]: auth.value };
  }
  if (auth.type === "custom") {
    return await auth.getHeaders();
  }
  return {};
}
function createFetchClient(options) {
  const fetchFn = options.fetchImpl ?? globalThis.fetch;
  return {
    async request({
      method,
      path,
      query,
      body,
      headers
    }) {
      const url = buildUrl(options.baseUrl, path, query);
      const authHeaders = await buildAuthHeaders(options.auth);
      const res = await fetchFn(url, {
        method,
        headers: {
          ...body ? { "Content-Type": "application/json" } : {},
          ...authHeaders,
          ...headers
        },
        body: body ? JSON.stringify(body) : void 0
      });
      const text = await res.text();
      const isJson = (res.headers.get("content-type") || "").includes("application/json");
      const data = isJson && text ? JSON.parse(text) : text;
      if (!res.ok) {
        const errBody = isJson ? data : void 0;
        const errorDetail = errBody?.error;
        throw new IcebergError(
          errorDetail?.message ?? `Request failed with status ${res.status}`,
          {
            status: res.status,
            icebergType: errorDetail?.type,
            icebergCode: errorDetail?.code,
            details: errBody
          }
        );
      }
      return { status: res.status, headers: res.headers, data };
    }
  };
}

// src/catalog/namespaces.ts
function namespaceToPath(namespace) {
  return namespace.join("");
}
var NamespaceOperations = class {
  constructor(client, prefix = "") {
    this.client = client;
    this.prefix = prefix;
  }
  async listNamespaces(parent) {
    const query = parent ? { parent: namespaceToPath(parent.namespace) } : void 0;
    const response = await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces`,
      query
    });
    return response.data.namespaces.map((ns) => ({ namespace: ns }));
  }
  async createNamespace(id, metadata) {
    const request = {
      namespace: id.namespace,
      properties: metadata?.properties
    };
    const response = await this.client.request({
      method: "POST",
      path: `${this.prefix}/namespaces`,
      body: request
    });
    return response.data;
  }
  async dropNamespace(id) {
    await this.client.request({
      method: "DELETE",
      path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
    });
  }
  async loadNamespaceMetadata(id) {
    const response = await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
    });
    return {
      properties: response.data.properties
    };
  }
  async namespaceExists(id) {
    try {
      await this.client.request({
        method: "HEAD",
        path: `${this.prefix}/namespaces/${namespaceToPath(id.namespace)}`
      });
      return true;
    } catch (error) {
      if (error instanceof IcebergError && error.status === 404) {
        return false;
      }
      throw error;
    }
  }
  async createNamespaceIfNotExists(id, metadata) {
    try {
      return await this.createNamespace(id, metadata);
    } catch (error) {
      if (error instanceof IcebergError && error.status === 409) {
        return;
      }
      throw error;
    }
  }
};

// src/catalog/tables.ts
function namespaceToPath2(namespace) {
  return namespace.join("");
}
var TableOperations = class {
  constructor(client, prefix = "", accessDelegation) {
    this.client = client;
    this.prefix = prefix;
    this.accessDelegation = accessDelegation;
  }
  async listTables(namespace) {
    const response = await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`
    });
    return response.data.identifiers;
  }
  async createTable(namespace, request) {
    const headers = {};
    if (this.accessDelegation) {
      headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
    }
    const response = await this.client.request({
      method: "POST",
      path: `${this.prefix}/namespaces/${namespaceToPath2(namespace.namespace)}/tables`,
      body: request,
      headers
    });
    return response.data.metadata;
  }
  async updateTable(id, request) {
    const response = await this.client.request({
      method: "POST",
      path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
      body: request
    });
    return {
      "metadata-location": response.data["metadata-location"],
      metadata: response.data.metadata
    };
  }
  async dropTable(id, options) {
    await this.client.request({
      method: "DELETE",
      path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
      query: { purgeRequested: String(options?.purge ?? false) }
    });
  }
  async loadTable(id) {
    const headers = {};
    if (this.accessDelegation) {
      headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
    }
    const response = await this.client.request({
      method: "GET",
      path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
      headers
    });
    return response.data.metadata;
  }
  async tableExists(id) {
    const headers = {};
    if (this.accessDelegation) {
      headers["X-Iceberg-Access-Delegation"] = this.accessDelegation;
    }
    try {
      await this.client.request({
        method: "HEAD",
        path: `${this.prefix}/namespaces/${namespaceToPath2(id.namespace)}/tables/${id.name}`,
        headers
      });
      return true;
    } catch (error) {
      if (error instanceof IcebergError && error.status === 404) {
        return false;
      }
      throw error;
    }
  }
  async createTableIfNotExists(namespace, request) {
    try {
      return await this.createTable(namespace, request);
    } catch (error) {
      if (error instanceof IcebergError && error.status === 409) {
        return await this.loadTable({ namespace: namespace.namespace, name: request.name });
      }
      throw error;
    }
  }
};

// src/catalog/IcebergRestCatalog.ts
var IcebergRestCatalog = class {
  /**
   * Creates a new Iceberg REST Catalog client.
   *
   * @param options - Configuration options for the catalog client
   */
  constructor(options) {
    let prefix = "v1";
    if (options.catalogName) {
      prefix += `/${options.catalogName}`;
    }
    const baseUrl = options.baseUrl.endsWith("/") ? options.baseUrl : `${options.baseUrl}/`;
    this.client = createFetchClient({
      baseUrl,
      auth: options.auth,
      fetchImpl: options.fetch
    });
    this.accessDelegation = options.accessDelegation?.join(",");
    this.namespaceOps = new NamespaceOperations(this.client, prefix);
    this.tableOps = new TableOperations(this.client, prefix, this.accessDelegation);
  }
  /**
   * Lists all namespaces in the catalog.
   *
   * @param parent - Optional parent namespace to list children under
   * @returns Array of namespace identifiers
   *
   * @example
   * ```typescript
   * // List all top-level namespaces
   * const namespaces = await catalog.listNamespaces();
   *
   * // List namespaces under a parent
   * const children = await catalog.listNamespaces({ namespace: ['analytics'] });
   * ```
   */
  async listNamespaces(parent) {
    return this.namespaceOps.listNamespaces(parent);
  }
  /**
   * Creates a new namespace in the catalog.
   *
   * @param id - Namespace identifier to create
   * @param metadata - Optional metadata properties for the namespace
   * @returns Response containing the created namespace and its properties
   *
   * @example
   * ```typescript
   * const response = await catalog.createNamespace(
   *   { namespace: ['analytics'] },
   *   { properties: { owner: 'data-team' } }
   * );
   * console.log(response.namespace); // ['analytics']
   * console.log(response.properties); // { owner: 'data-team', ... }
   * ```
   */
  async createNamespace(id, metadata) {
    return this.namespaceOps.createNamespace(id, metadata);
  }
  /**
   * Drops a namespace from the catalog.
   *
   * The namespace must be empty (contain no tables) before it can be dropped.
   *
   * @param id - Namespace identifier to drop
   *
   * @example
   * ```typescript
   * await catalog.dropNamespace({ namespace: ['analytics'] });
   * ```
   */
  async dropNamespace(id) {
    await this.namespaceOps.dropNamespace(id);
  }
  /**
   * Loads metadata for a namespace.
   *
   * @param id - Namespace identifier to load
   * @returns Namespace metadata including properties
   *
   * @example
   * ```typescript
   * const metadata = await catalog.loadNamespaceMetadata({ namespace: ['analytics'] });
   * console.log(metadata.properties);
   * ```
   */
  async loadNamespaceMetadata(id) {
    return this.namespaceOps.loadNamespaceMetadata(id);
  }
  /**
   * Lists all tables in a namespace.
   *
   * @param namespace - Namespace identifier to list tables from
   * @returns Array of table identifiers
   *
   * @example
   * ```typescript
   * const tables = await catalog.listTables({ namespace: ['analytics'] });
   * console.log(tables); // [{ namespace: ['analytics'], name: 'events' }, ...]
   * ```
   */
  async listTables(namespace) {
    return this.tableOps.listTables(namespace);
  }
  /**
   * Creates a new table in the catalog.
   *
   * @param namespace - Namespace to create the table in
   * @param request - Table creation request including name, schema, partition spec, etc.
   * @returns Table metadata for the created table
   *
   * @example
   * ```typescript
   * const metadata = await catalog.createTable(
   *   { namespace: ['analytics'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
   *       ],
   *       'schema-id': 0
   *     },
   *     'partition-spec': {
   *       'spec-id': 0,
   *       fields: [
   *         { source_id: 2, field_id: 1000, name: 'ts_day', transform: 'day' }
   *       ]
   *     }
   *   }
   * );
   * ```
   */
  async createTable(namespace, request) {
    return this.tableOps.createTable(namespace, request);
  }
  /**
   * Updates an existing table's metadata.
   *
   * Can update the schema, partition spec, or properties of a table.
   *
   * @param id - Table identifier to update
   * @param request - Update request with fields to modify
   * @returns Response containing the metadata location and updated table metadata
   *
   * @example
   * ```typescript
   * const response = await catalog.updateTable(
   *   { namespace: ['analytics'], name: 'events' },
   *   {
   *     properties: { 'read.split.target-size': '134217728' }
   *   }
   * );
   * console.log(response['metadata-location']); // s3://...
   * console.log(response.metadata); // TableMetadata object
   * ```
   */
  async updateTable(id, request) {
    return this.tableOps.updateTable(id, request);
  }
  /**
   * Drops a table from the catalog.
   *
   * @param id - Table identifier to drop
   *
   * @example
   * ```typescript
   * await catalog.dropTable({ namespace: ['analytics'], name: 'events' });
   * ```
   */
  async dropTable(id, options) {
    await this.tableOps.dropTable(id, options);
  }
  /**
   * Loads metadata for a table.
   *
   * @param id - Table identifier to load
   * @returns Table metadata including schema, partition spec, location, etc.
   *
   * @example
   * ```typescript
   * const metadata = await catalog.loadTable({ namespace: ['analytics'], name: 'events' });
   * console.log(metadata.schema);
   * console.log(metadata.location);
   * ```
   */
  async loadTable(id) {
    return this.tableOps.loadTable(id);
  }
  /**
   * Checks if a namespace exists in the catalog.
   *
   * @param id - Namespace identifier to check
   * @returns True if the namespace exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await catalog.namespaceExists({ namespace: ['analytics'] });
   * console.log(exists); // true or false
   * ```
   */
  async namespaceExists(id) {
    return this.namespaceOps.namespaceExists(id);
  }
  /**
   * Checks if a table exists in the catalog.
   *
   * @param id - Table identifier to check
   * @returns True if the table exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await catalog.tableExists({ namespace: ['analytics'], name: 'events' });
   * console.log(exists); // true or false
   * ```
   */
  async tableExists(id) {
    return this.tableOps.tableExists(id);
  }
  /**
   * Creates a namespace if it does not exist.
   *
   * If the namespace already exists, returns void. If created, returns the response.
   *
   * @param id - Namespace identifier to create
   * @param metadata - Optional metadata properties for the namespace
   * @returns Response containing the created namespace and its properties, or void if it already exists
   *
   * @example
   * ```typescript
   * const response = await catalog.createNamespaceIfNotExists(
   *   { namespace: ['analytics'] },
   *   { properties: { owner: 'data-team' } }
   * );
   * if (response) {
   *   console.log('Created:', response.namespace);
   * } else {
   *   console.log('Already exists');
   * }
   * ```
   */
  async createNamespaceIfNotExists(id, metadata) {
    return this.namespaceOps.createNamespaceIfNotExists(id, metadata);
  }
  /**
   * Creates a table if it does not exist.
   *
   * If the table already exists, returns its metadata instead.
   *
   * @param namespace - Namespace to create the table in
   * @param request - Table creation request including name, schema, partition spec, etc.
   * @returns Table metadata for the created or existing table
   *
   * @example
   * ```typescript
   * const metadata = await catalog.createTableIfNotExists(
   *   { namespace: ['analytics'] },
   *   {
   *     name: 'events',
   *     schema: {
   *       type: 'struct',
   *       fields: [
   *         { id: 1, name: 'id', type: 'long', required: true },
   *         { id: 2, name: 'timestamp', type: 'timestamp', required: true }
   *       ],
   *       'schema-id': 0
   *     }
   *   }
   * );
   * ```
   */
  async createTableIfNotExists(namespace, request) {
    return this.tableOps.createTableIfNotExists(namespace, request);
  }
};

//#region src/lib/errors.ts
var StorageError = class extends Error {
	constructor(message) {
		super(message);
		this.__isStorageError = true;
		this.name = "StorageError";
	}
};
function isStorageError(error) {
	return typeof error === "object" && error !== null && "__isStorageError" in error;
}
var StorageApiError = class extends StorageError {
	constructor(message, status, statusCode) {
		super(message);
		this.name = "StorageApiError";
		this.status = status;
		this.statusCode = statusCode;
	}
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			status: this.status,
			statusCode: this.statusCode
		};
	}
};
var StorageUnknownError = class extends StorageError {
	constructor(message, originalError) {
		super(message);
		this.name = "StorageUnknownError";
		this.originalError = originalError;
	}
};

//#endregion
//#region src/lib/helpers.ts
const resolveFetch$1$1 = (customFetch) => {
	if (customFetch) return (...args) => customFetch(...args);
	return (...args) => fetch(...args);
};
const resolveResponse$1 = () => {
	return Response;
};
const recursiveToCamel = (item) => {
	if (Array.isArray(item)) return item.map((el) => recursiveToCamel(el));
	else if (typeof item === "function" || item !== Object(item)) return item;
	const result = {};
	Object.entries(item).forEach(([key, value]) => {
		const newKey = key.replace(/([-_][a-z])/gi, (c) => c.toUpperCase().replace(/[-_]/g, ""));
		result[newKey] = recursiveToCamel(value);
	});
	return result;
};
/**
* Determine if input is a plain object
* An object is plain if it's created by either {}, new Object(), or Object.create(null)
* source: https://github.com/sindresorhus/is-plain-obj
*/
const isPlainObject$1 = (value) => {
	if (typeof value !== "object" || value === null) return false;
	const prototype = Object.getPrototypeOf(value);
	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
};
/**
* Validates if a given bucket name is valid according to Supabase Storage API rules
* Mirrors backend validation from: storage/src/storage/limits.ts:isValidBucketName()
*
* Rules:
* - Length: 1-100 characters
* - Allowed characters: alphanumeric (a-z, A-Z, 0-9), underscore (_), and safe special characters
* - Safe special characters: ! - . * ' ( ) space & $ @ = ; : + , ?
* - Forbidden: path separators (/, \), path traversal (..), leading/trailing whitespace
*
* AWS S3 Reference: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-keys.html
*
* @param bucketName - The bucket name to validate
* @returns true if valid, false otherwise
*/
const isValidBucketName = (bucketName) => {
	if (!bucketName || typeof bucketName !== "string") return false;
	if (bucketName.length === 0 || bucketName.length > 100) return false;
	if (bucketName.trim() !== bucketName) return false;
	if (bucketName.includes("/") || bucketName.includes("\\")) return false;
	return /^[\w!.\*'() &$@=;:+,?-]+$/.test(bucketName);
};

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/typeof.js
function _typeof$1(o) {
	"@babel/helpers - typeof";
	return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
		return typeof o$1;
	} : function(o$1) {
		return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
	}, _typeof$1(o);
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPrimitive.js
function toPrimitive$1(t, r) {
	if ("object" != _typeof$1(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r);
		if ("object" != _typeof$1(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPropertyKey.js
function toPropertyKey$1(t) {
	var i = toPrimitive$1(t, "string");
	return "symbol" == _typeof$1(i) ? i : i + "";
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/defineProperty.js
function _defineProperty$1(e, r, t) {
	return (r = toPropertyKey$1(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: true,
		configurable: true,
		writable: true
	}) : e[r] = t, e;
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/objectSpread2.js
function ownKeys$1(e, r) {
	var t = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var o = Object.getOwnPropertySymbols(e);
		r && (o = o.filter(function(r$1) {
			return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
		})), t.push.apply(t, o);
	}
	return t;
}
function _objectSpread2$1(e) {
	for (var r = 1; r < arguments.length; r++) {
		var t = null != arguments[r] ? arguments[r] : {};
		r % 2 ? ownKeys$1(Object(t), true).forEach(function(r$1) {
			_defineProperty$1(e, r$1, t[r$1]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function(r$1) {
			Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
		});
	}
	return e;
}

//#endregion
//#region src/lib/fetch.ts
const _getErrorMessage$1 = (err) => {
	var _err$error;
	return err.msg || err.message || err.error_description || (typeof err.error === "string" ? err.error : (_err$error = err.error) === null || _err$error === void 0 ? void 0 : _err$error.message) || JSON.stringify(err);
};
const handleError$1 = async (error, reject, options) => {
	if (error instanceof await resolveResponse$1() && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) error.json().then((err) => {
		const status = error.status || 500;
		const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || status + "";
		reject(new StorageApiError(_getErrorMessage$1(err), status, statusCode));
	}).catch((err) => {
		reject(new StorageUnknownError(_getErrorMessage$1(err), err));
	});
	else reject(new StorageUnknownError(_getErrorMessage$1(error), error));
};
const _getRequestParams$1 = (method, options, parameters, body) => {
	const params = {
		method,
		headers: (options === null || options === void 0 ? void 0 : options.headers) || {}
	};
	if (method === "GET" || !body) return params;
	if (isPlainObject$1(body)) {
		params.headers = _objectSpread2$1({ "Content-Type": "application/json" }, options === null || options === void 0 ? void 0 : options.headers);
		params.body = JSON.stringify(body);
	} else params.body = body;
	if (options === null || options === void 0 ? void 0 : options.duplex) params.duplex = options.duplex;
	return _objectSpread2$1(_objectSpread2$1({}, params), parameters);
};
async function _handleRequest$1(fetcher, method, url, options, parameters, body) {
	return new Promise((resolve, reject) => {
		fetcher(url, _getRequestParams$1(method, options, parameters, body)).then((result) => {
			if (!result.ok) throw result;
			if (options === null || options === void 0 ? void 0 : options.noResolveJson) return result;
			return result.json();
		}).then((data) => resolve(data)).catch((error) => handleError$1(error, reject, options));
	});
}
async function get(fetcher, url, options, parameters) {
	return _handleRequest$1(fetcher, "GET", url, options, parameters);
}
async function post$1(fetcher, url, body, options, parameters) {
	return _handleRequest$1(fetcher, "POST", url, options, parameters, body);
}
async function put(fetcher, url, body, options, parameters) {
	return _handleRequest$1(fetcher, "PUT", url, options, parameters, body);
}
async function head(fetcher, url, options, parameters) {
	return _handleRequest$1(fetcher, "HEAD", url, _objectSpread2$1(_objectSpread2$1({}, options), {}, { noResolveJson: true }), parameters);
}
async function remove(fetcher, url, body, options, parameters) {
	return _handleRequest$1(fetcher, "DELETE", url, options, parameters, body);
}

//#endregion
//#region src/packages/StreamDownloadBuilder.ts
var StreamDownloadBuilder = class {
	constructor(downloadFn, shouldThrowOnError) {
		this.downloadFn = downloadFn;
		this.shouldThrowOnError = shouldThrowOnError;
	}
	then(onfulfilled, onrejected) {
		return this.execute().then(onfulfilled, onrejected);
	}
	async execute() {
		var _this = this;
		try {
			return {
				data: (await _this.downloadFn()).body,
				error: null
			};
		} catch (error) {
			if (_this.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
};

//#endregion
//#region src/packages/BlobDownloadBuilder.ts
let _Symbol$toStringTag;
_Symbol$toStringTag = Symbol.toStringTag;
var BlobDownloadBuilder = class {
	constructor(downloadFn, shouldThrowOnError) {
		this.downloadFn = downloadFn;
		this.shouldThrowOnError = shouldThrowOnError;
		this[_Symbol$toStringTag] = "BlobDownloadBuilder";
		this.promise = null;
	}
	asStream() {
		return new StreamDownloadBuilder(this.downloadFn, this.shouldThrowOnError);
	}
	then(onfulfilled, onrejected) {
		return this.getPromise().then(onfulfilled, onrejected);
	}
	catch(onrejected) {
		return this.getPromise().catch(onrejected);
	}
	finally(onfinally) {
		return this.getPromise().finally(onfinally);
	}
	getPromise() {
		if (!this.promise) this.promise = this.execute();
		return this.promise;
	}
	async execute() {
		var _this = this;
		try {
			return {
				data: await (await _this.downloadFn()).blob(),
				error: null
			};
		} catch (error) {
			if (_this.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
};

//#endregion
//#region src/packages/StorageFileApi.ts
const DEFAULT_SEARCH_OPTIONS = {
	limit: 100,
	offset: 0,
	sortBy: {
		column: "name",
		order: "asc"
	}
};
const DEFAULT_FILE_OPTIONS = {
	cacheControl: "3600",
	contentType: "text/plain;charset=UTF-8",
	upsert: false
};
var StorageFileApi = class {
	constructor(url, headers = {}, bucketId, fetch$1) {
		this.shouldThrowOnError = false;
		this.url = url;
		this.headers = headers;
		this.bucketId = bucketId;
		this.fetch = resolveFetch$1$1(fetch$1);
	}
	/**
	* Enable throwing errors instead of returning them.
	*
	* @category File Buckets
	*/
	throwOnError() {
		this.shouldThrowOnError = true;
		return this;
	}
	/**
	* Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
	*
	* @param method HTTP method.
	* @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
	* @param fileBody The body of the file to be stored in the bucket.
	*/
	async uploadOrUpdate(method, path, fileBody, fileOptions) {
		var _this = this;
		try {
			let body;
			const options = _objectSpread2$1(_objectSpread2$1({}, DEFAULT_FILE_OPTIONS), fileOptions);
			let headers = _objectSpread2$1(_objectSpread2$1({}, _this.headers), method === "POST" && { "x-upsert": String(options.upsert) });
			const metadata = options.metadata;
			if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
				body = new FormData();
				body.append("cacheControl", options.cacheControl);
				if (metadata) body.append("metadata", _this.encodeMetadata(metadata));
				body.append("", fileBody);
			} else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
				body = fileBody;
				if (!body.has("cacheControl")) body.append("cacheControl", options.cacheControl);
				if (metadata && !body.has("metadata")) body.append("metadata", _this.encodeMetadata(metadata));
			} else {
				body = fileBody;
				headers["cache-control"] = `max-age=${options.cacheControl}`;
				headers["content-type"] = options.contentType;
				if (metadata) headers["x-metadata"] = _this.toBase64(_this.encodeMetadata(metadata));
				if ((typeof ReadableStream !== "undefined" && body instanceof ReadableStream || body && typeof body === "object" && "pipe" in body && typeof body.pipe === "function") && !options.duplex) options.duplex = "half";
			}
			if (fileOptions === null || fileOptions === void 0 ? void 0 : fileOptions.headers) headers = _objectSpread2$1(_objectSpread2$1({}, headers), fileOptions.headers);
			const cleanPath = _this._removeEmptyFolders(path);
			const _path = _this._getFinalPath(cleanPath);
			const data = await (method == "PUT" ? put : post$1)(_this.fetch, `${_this.url}/object/${_path}`, body, _objectSpread2$1({ headers }, (options === null || options === void 0 ? void 0 : options.duplex) ? { duplex: options.duplex } : {}));
			return {
				data: {
					path: cleanPath,
					id: data.Id,
					fullPath: data.Key
				},
				error: null
			};
		} catch (error) {
			if (_this.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Uploads a file to an existing bucket.
	*
	* @category File Buckets
	* @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
	* @param fileBody The body of the file to be stored in the bucket.
	* @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
	* @returns Promise with response containing file path, id, and fullPath or error
	*
	* @example Upload file
	* ```js
	* const avatarFile = event.target.files[0]
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .upload('public/avatar1.png', avatarFile, {
	*     cacheControl: '3600',
	*     upsert: false
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "path": "public/avatar1.png",
	*     "fullPath": "avatars/public/avatar1.png"
	*   },
	*   "error": null
	* }
	* ```
	*
	* @example Upload file using `ArrayBuffer` from base64 file data
	* ```js
	* import { decode } from 'base64-arraybuffer'
	*
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .upload('public/avatar1.png', decode('base64FileData'), {
	*     contentType: 'image/png'
	*   })
	* ```
	*/
	async upload(path, fileBody, fileOptions) {
		return this.uploadOrUpdate("POST", path, fileBody, fileOptions);
	}
	/**
	* Upload a file with a token generated from `createSignedUploadUrl`.
	*
	* @category File Buckets
	* @param path The file path, including the file name. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
	* @param token The token generated from `createSignedUploadUrl`
	* @param fileBody The body of the file to be stored in the bucket.
	* @param fileOptions HTTP headers (cacheControl, contentType, etc.).
	* **Note:** The `upsert` option has no effect here. To enable upsert behavior,
	* pass `{ upsert: true }` when calling `createSignedUploadUrl()` instead.
	* @returns Promise with response containing file path and fullPath or error
	*
	* @example Upload to a signed URL
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .uploadToSignedUrl('folder/cat.jpg', 'token-from-createSignedUploadUrl', file)
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "path": "folder/cat.jpg",
	*     "fullPath": "avatars/folder/cat.jpg"
	*   },
	*   "error": null
	* }
	* ```
	*/
	async uploadToSignedUrl(path, token, fileBody, fileOptions) {
		var _this3 = this;
		const cleanPath = _this3._removeEmptyFolders(path);
		const _path = _this3._getFinalPath(cleanPath);
		const url = new URL(_this3.url + `/object/upload/sign/${_path}`);
		url.searchParams.set("token", token);
		try {
			let body;
			const options = _objectSpread2$1({ upsert: DEFAULT_FILE_OPTIONS.upsert }, fileOptions);
			const headers = _objectSpread2$1(_objectSpread2$1({}, _this3.headers), { "x-upsert": String(options.upsert) });
			if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
				body = new FormData();
				body.append("cacheControl", options.cacheControl);
				body.append("", fileBody);
			} else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
				body = fileBody;
				body.append("cacheControl", options.cacheControl);
			} else {
				body = fileBody;
				headers["cache-control"] = `max-age=${options.cacheControl}`;
				headers["content-type"] = options.contentType;
			}
			return {
				data: {
					path: cleanPath,
					fullPath: (await put(_this3.fetch, url.toString(), body, { headers })).Key
				},
				error: null
			};
		} catch (error) {
			if (_this3.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Creates a signed upload URL.
	* Signed upload URLs can be used to upload files to the bucket without further authentication.
	* They are valid for 2 hours.
	*
	* @category File Buckets
	* @param path The file path, including the current file name. For example `folder/image.png`.
	* @param options.upsert If set to true, allows the file to be overwritten if it already exists.
	* @returns Promise with response containing signed upload URL, token, and path or error
	*
	* @example Create Signed Upload URL
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUploadUrl('folder/cat.jpg')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "signedUrl": "https://example.supabase.co/storage/v1/object/upload/sign/avatars/folder/cat.jpg?token=<TOKEN>",
	*     "path": "folder/cat.jpg",
	*     "token": "<TOKEN>"
	*   },
	*   "error": null
	* }
	* ```
	*/
	async createSignedUploadUrl(path, options) {
		var _this4 = this;
		try {
			let _path = _this4._getFinalPath(path);
			const headers = _objectSpread2$1({}, _this4.headers);
			if (options === null || options === void 0 ? void 0 : options.upsert) headers["x-upsert"] = "true";
			const data = await post$1(_this4.fetch, `${_this4.url}/object/upload/sign/${_path}`, {}, { headers });
			const url = new URL(_this4.url + data.url);
			const token = url.searchParams.get("token");
			if (!token) throw new StorageError("No token returned by API");
			return {
				data: {
					signedUrl: url.toString(),
					path,
					token
				},
				error: null
			};
		} catch (error) {
			if (_this4.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Replaces an existing file at the specified path with a new one.
	*
	* @category File Buckets
	* @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to update.
	* @param fileBody The body of the file to be stored in the bucket.
	* @param fileOptions Optional file upload options including cacheControl, contentType, upsert, and metadata.
	* @returns Promise with response containing file path, id, and fullPath or error
	*
	* @example Update file
	* ```js
	* const avatarFile = event.target.files[0]
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .update('public/avatar1.png', avatarFile, {
	*     cacheControl: '3600',
	*     upsert: true
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "path": "public/avatar1.png",
	*     "fullPath": "avatars/public/avatar1.png"
	*   },
	*   "error": null
	* }
	* ```
	*
	* @example Update file using `ArrayBuffer` from base64 file data
	* ```js
	* import {decode} from 'base64-arraybuffer'
	*
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .update('public/avatar1.png', decode('base64FileData'), {
	*     contentType: 'image/png'
	*   })
	* ```
	*/
	async update(path, fileBody, fileOptions) {
		return this.uploadOrUpdate("PUT", path, fileBody, fileOptions);
	}
	/**
	* Moves an existing file to a new path in the same bucket.
	*
	* @category File Buckets
	* @param fromPath The original file path, including the current file name. For example `folder/image.png`.
	* @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
	* @param options The destination options.
	* @returns Promise with response containing success message or error
	*
	* @example Move file
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .move('public/avatar1.png', 'private/avatar2.png')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully moved"
	*   },
	*   "error": null
	* }
	* ```
	*/
	async move(fromPath, toPath, options) {
		var _this6 = this;
		try {
			return {
				data: await post$1(_this6.fetch, `${_this6.url}/object/move`, {
					bucketId: _this6.bucketId,
					sourceKey: fromPath,
					destinationKey: toPath,
					destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
				}, { headers: _this6.headers }),
				error: null
			};
		} catch (error) {
			if (_this6.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Copies an existing file to a new path in the same bucket.
	*
	* @category File Buckets
	* @param fromPath The original file path, including the current file name. For example `folder/image.png`.
	* @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
	* @param options The destination options.
	* @returns Promise with response containing copied file path or error
	*
	* @example Copy file
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .copy('public/avatar1.png', 'private/avatar2.png')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "path": "avatars/private/avatar2.png"
	*   },
	*   "error": null
	* }
	* ```
	*/
	async copy(fromPath, toPath, options) {
		var _this7 = this;
		try {
			return {
				data: { path: (await post$1(_this7.fetch, `${_this7.url}/object/copy`, {
					bucketId: _this7.bucketId,
					sourceKey: fromPath,
					destinationKey: toPath,
					destinationBucket: options === null || options === void 0 ? void 0 : options.destinationBucket
				}, { headers: _this7.headers })).Key },
				error: null
			};
		} catch (error) {
			if (_this7.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Creates a signed URL. Use a signed URL to share a file for a fixed amount of time.
	*
	* @category File Buckets
	* @param path The file path, including the current file name. For example `folder/image.png`.
	* @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
	* @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
	* @param options.transform Transform the asset before serving it to the client.
	* @returns Promise with response containing signed URL or error
	*
	* @example Create Signed URL
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUrl('folder/avatar1.png', 60)
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
	*   },
	*   "error": null
	* }
	* ```
	*
	* @example Create a signed URL for an asset with transformations
	* ```js
	* const { data } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUrl('folder/avatar1.png', 60, {
	*     transform: {
	*       width: 100,
	*       height: 100,
	*     }
	*   })
	* ```
	*
	* @example Create a signed URL which triggers the download of the asset
	* ```js
	* const { data } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUrl('folder/avatar1.png', 60, {
	*     download: true,
	*   })
	* ```
	*/
	async createSignedUrl(path, expiresIn, options) {
		var _this8 = this;
		try {
			let _path = _this8._getFinalPath(path);
			let data = await post$1(_this8.fetch, `${_this8.url}/object/sign/${_path}`, _objectSpread2$1({ expiresIn }, (options === null || options === void 0 ? void 0 : options.transform) ? { transform: options.transform } : {}), { headers: _this8.headers });
			const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
			data = { signedUrl: encodeURI(`${_this8.url}${data.signedURL}${downloadQueryParam}`) };
			return {
				data,
				error: null
			};
		} catch (error) {
			if (_this8.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Creates multiple signed URLs. Use a signed URL to share a file for a fixed amount of time.
	*
	* @category File Buckets
	* @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
	* @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
	* @param options.download triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
	* @returns Promise with response containing array of objects with signedUrl, path, and error or error
	*
	* @example Create Signed URLs
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .createSignedUrls(['folder/avatar1.png', 'folder/avatar2.png'], 60)
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": [
	*     {
	*       "error": null,
	*       "path": "folder/avatar1.png",
	*       "signedURL": "/object/sign/avatars/folder/avatar1.png?token=<TOKEN>",
	*       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar1.png?token=<TOKEN>"
	*     },
	*     {
	*       "error": null,
	*       "path": "folder/avatar2.png",
	*       "signedURL": "/object/sign/avatars/folder/avatar2.png?token=<TOKEN>",
	*       "signedUrl": "https://example.supabase.co/storage/v1/object/sign/avatars/folder/avatar2.png?token=<TOKEN>"
	*     }
	*   ],
	*   "error": null
	* }
	* ```
	*/
	async createSignedUrls(paths, expiresIn, options) {
		var _this9 = this;
		try {
			const data = await post$1(_this9.fetch, `${_this9.url}/object/sign/${_this9.bucketId}`, {
				expiresIn,
				paths
			}, { headers: _this9.headers });
			const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
			return {
				data: data.map((datum) => _objectSpread2$1(_objectSpread2$1({}, datum), {}, { signedUrl: datum.signedURL ? encodeURI(`${_this9.url}${datum.signedURL}${downloadQueryParam}`) : null })),
				error: null
			};
		} catch (error) {
			if (_this9.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Downloads a file from a private bucket. For public buckets, make a request to the URL returned from `getPublicUrl` instead.
	*
	* @category File Buckets
	* @param path The full path and file name of the file to be downloaded. For example `folder/image.png`.
	* @param options.transform Transform the asset before serving it to the client.
	* @returns BlobDownloadBuilder instance for downloading the file
	*
	* @example Download file
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .download('folder/avatar1.png')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": <BLOB>,
	*   "error": null
	* }
	* ```
	*
	* @example Download file with transformations
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .download('folder/avatar1.png', {
	*     transform: {
	*       width: 100,
	*       height: 100,
	*       quality: 80
	*     }
	*   })
	* ```
	*/
	download(path, options) {
		const renderPath = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined" ? "render/image/authenticated" : "object";
		const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
		const queryString = transformationQuery ? `?${transformationQuery}` : "";
		const _path = this._getFinalPath(path);
		const downloadFn = () => get(this.fetch, `${this.url}/${renderPath}/${_path}${queryString}`, {
			headers: this.headers,
			noResolveJson: true
		});
		return new BlobDownloadBuilder(downloadFn, this.shouldThrowOnError);
	}
	/**
	* Retrieves the details of an existing file.
	*
	* @category File Buckets
	* @param path The file path, including the file name. For example `folder/image.png`.
	* @returns Promise with response containing file metadata or error
	*
	* @example Get file info
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .info('folder/avatar1.png')
	* ```
	*/
	async info(path) {
		var _this10 = this;
		const _path = _this10._getFinalPath(path);
		try {
			return {
				data: recursiveToCamel(await get(_this10.fetch, `${_this10.url}/object/info/${_path}`, { headers: _this10.headers })),
				error: null
			};
		} catch (error) {
			if (_this10.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Checks the existence of a file.
	*
	* @category File Buckets
	* @param path The file path, including the file name. For example `folder/image.png`.
	* @returns Promise with response containing boolean indicating file existence or error
	*
	* @example Check file existence
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .exists('folder/avatar1.png')
	* ```
	*/
	async exists(path) {
		var _this11 = this;
		const _path = _this11._getFinalPath(path);
		try {
			await head(_this11.fetch, `${_this11.url}/object/${_path}`, { headers: _this11.headers });
			return {
				data: true,
				error: null
			};
		} catch (error) {
			if (_this11.shouldThrowOnError) throw error;
			if (isStorageError(error) && error instanceof StorageUnknownError) {
				const originalError = error.originalError;
				if ([400, 404].includes(originalError === null || originalError === void 0 ? void 0 : originalError.status)) return {
					data: false,
					error
				};
			}
			throw error;
		}
	}
	/**
	* A simple convenience function to get the URL for an asset in a public bucket. If you do not want to use this function, you can construct the public URL by concatenating the bucket URL with the path to the asset.
	* This function does not verify if the bucket is public. If a public URL is created for a bucket which is not public, you will not be able to download the asset.
	*
	* @category File Buckets
	* @param path The path and name of the file to generate the public URL for. For example `folder/image.png`.
	* @param options.download Triggers the file as a download if set to true. Set this parameter as the name of the file if you want to trigger the download with a different filename.
	* @param options.transform Transform the asset before serving it to the client.
	* @returns Object with public URL
	*
	* @example Returns the URL for an asset in a public bucket
	* ```js
	* const { data } = supabase
	*   .storage
	*   .from('public-bucket')
	*   .getPublicUrl('folder/avatar1.png')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "publicUrl": "https://example.supabase.co/storage/v1/object/public/public-bucket/folder/avatar1.png"
	*   }
	* }
	* ```
	*
	* @example Returns the URL for an asset in a public bucket with transformations
	* ```js
	* const { data } = supabase
	*   .storage
	*   .from('public-bucket')
	*   .getPublicUrl('folder/avatar1.png', {
	*     transform: {
	*       width: 100,
	*       height: 100,
	*     }
	*   })
	* ```
	*
	* @example Returns the URL which triggers the download of an asset in a public bucket
	* ```js
	* const { data } = supabase
	*   .storage
	*   .from('public-bucket')
	*   .getPublicUrl('folder/avatar1.png', {
	*     download: true,
	*   })
	* ```
	*/
	getPublicUrl(path, options) {
		const _path = this._getFinalPath(path);
		const _queryString = [];
		const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `download=${options.download === true ? "" : options.download}` : "";
		if (downloadQueryParam !== "") _queryString.push(downloadQueryParam);
		const renderPath = typeof (options === null || options === void 0 ? void 0 : options.transform) !== "undefined" ? "render/image" : "object";
		const transformationQuery = this.transformOptsToQueryString((options === null || options === void 0 ? void 0 : options.transform) || {});
		if (transformationQuery !== "") _queryString.push(transformationQuery);
		let queryString = _queryString.join("&");
		if (queryString !== "") queryString = `?${queryString}`;
		return { data: { publicUrl: encodeURI(`${this.url}/${renderPath}/public/${_path}${queryString}`) } };
	}
	/**
	* Deletes files within the same bucket
	*
	* @category File Buckets
	* @param paths An array of files to delete, including the path and file name. For example [`'folder/image.png'`].
	* @returns Promise with response containing array of deleted file objects or error
	*
	* @example Delete file
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .remove(['folder/avatar1.png'])
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": [],
	*   "error": null
	* }
	* ```
	*/
	async remove(paths) {
		var _this12 = this;
		try {
			return {
				data: await remove(_this12.fetch, `${_this12.url}/object/${_this12.bucketId}`, { prefixes: paths }, { headers: _this12.headers }),
				error: null
			};
		} catch (error) {
			if (_this12.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Get file metadata
	* @param id the file id to retrieve metadata
	*/
	/**
	* Update file metadata
	* @param id the file id to update metadata
	* @param meta the new file metadata
	*/
	/**
	* Lists all the files and folders within a path of the bucket.
	*
	* @category File Buckets
	* @param path The folder path.
	* @param options Search options including limit (defaults to 100), offset, sortBy, and search
	* @param parameters Optional fetch parameters including signal for cancellation
	* @returns Promise with response containing array of files or error
	*
	* @example List files in a bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .list('folder', {
	*     limit: 100,
	*     offset: 0,
	*     sortBy: { column: 'name', order: 'asc' },
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": [
	*     {
	*       "name": "avatar1.png",
	*       "id": "e668cf7f-821b-4a2f-9dce-7dfa5dd1cfd2",
	*       "updated_at": "2024-05-22T23:06:05.580Z",
	*       "created_at": "2024-05-22T23:04:34.443Z",
	*       "last_accessed_at": "2024-05-22T23:04:34.443Z",
	*       "metadata": {
	*         "eTag": "\"c5e8c553235d9af30ef4f6e280790b92\"",
	*         "size": 32175,
	*         "mimetype": "image/png",
	*         "cacheControl": "max-age=3600",
	*         "lastModified": "2024-05-22T23:06:05.574Z",
	*         "contentLength": 32175,
	*         "httpStatusCode": 200
	*       }
	*     }
	*   ],
	*   "error": null
	* }
	* ```
	*
	* @example Search files in a bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .from('avatars')
	*   .list('folder', {
	*     limit: 100,
	*     offset: 0,
	*     sortBy: { column: 'name', order: 'asc' },
	*     search: 'jon'
	*   })
	* ```
	*/
	async list(path, options, parameters) {
		var _this13 = this;
		try {
			const body = _objectSpread2$1(_objectSpread2$1(_objectSpread2$1({}, DEFAULT_SEARCH_OPTIONS), options), {}, { prefix: path || "" });
			return {
				data: await post$1(_this13.fetch, `${_this13.url}/object/list/${_this13.bucketId}`, body, { headers: _this13.headers }, parameters),
				error: null
			};
		} catch (error) {
			if (_this13.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* @experimental this method signature might change in the future
	*
	* @category File Buckets
	* @param options search options
	* @param parameters
	*/
	async listV2(options, parameters) {
		var _this14 = this;
		try {
			const body = _objectSpread2$1({}, options);
			return {
				data: await post$1(_this14.fetch, `${_this14.url}/object/list-v2/${_this14.bucketId}`, body, { headers: _this14.headers }, parameters),
				error: null
			};
		} catch (error) {
			if (_this14.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	encodeMetadata(metadata) {
		return JSON.stringify(metadata);
	}
	toBase64(data) {
		if (typeof Buffer !== "undefined") return Buffer.from(data).toString("base64");
		return btoa(data);
	}
	_getFinalPath(path) {
		return `${this.bucketId}/${path.replace(/^\/+/, "")}`;
	}
	_removeEmptyFolders(path) {
		return path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
	}
	transformOptsToQueryString(transform) {
		const params = [];
		if (transform.width) params.push(`width=${transform.width}`);
		if (transform.height) params.push(`height=${transform.height}`);
		if (transform.resize) params.push(`resize=${transform.resize}`);
		if (transform.format) params.push(`format=${transform.format}`);
		if (transform.quality) params.push(`quality=${transform.quality}`);
		return params.join("&");
	}
};

//#endregion
//#region src/lib/version.ts
const version$2 = "2.91.1";

//#endregion
//#region src/lib/constants.ts
const DEFAULT_HEADERS$1$1 = { "X-Client-Info": `storage-js/${version$2}` };

//#endregion
//#region src/packages/StorageBucketApi.ts
var StorageBucketApi = class {
	constructor(url, headers = {}, fetch$1, opts) {
		this.shouldThrowOnError = false;
		const baseUrl = new URL(url);
		if (opts === null || opts === void 0 ? void 0 : opts.useNewHostname) {
			if (/supabase\.(co|in|red)$/.test(baseUrl.hostname) && !baseUrl.hostname.includes("storage.supabase.")) baseUrl.hostname = baseUrl.hostname.replace("supabase.", "storage.supabase.");
		}
		this.url = baseUrl.href.replace(/\/$/, "");
		this.headers = _objectSpread2$1(_objectSpread2$1({}, DEFAULT_HEADERS$1$1), headers);
		this.fetch = resolveFetch$1$1(fetch$1);
	}
	/**
	* Enable throwing errors instead of returning them.
	*
	* @category File Buckets
	*/
	throwOnError() {
		this.shouldThrowOnError = true;
		return this;
	}
	/**
	* Retrieves the details of all Storage buckets within an existing project.
	*
	* @category File Buckets
	* @param options Query parameters for listing buckets
	* @param options.limit Maximum number of buckets to return
	* @param options.offset Number of buckets to skip
	* @param options.sortColumn Column to sort by ('id', 'name', 'created_at', 'updated_at')
	* @param options.sortOrder Sort order ('asc' or 'desc')
	* @param options.search Search term to filter bucket names
	* @returns Promise with response containing array of buckets or error
	*
	* @example List buckets
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .listBuckets()
	* ```
	*
	* @example List buckets with options
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .listBuckets({
	*     limit: 10,
	*     offset: 0,
	*     sortColumn: 'created_at',
	*     sortOrder: 'desc',
	*     search: 'prod'
	*   })
	* ```
	*/
	async listBuckets(options) {
		var _this = this;
		try {
			const queryString = _this.listBucketOptionsToQueryString(options);
			return {
				data: await get(_this.fetch, `${_this.url}/bucket${queryString}`, { headers: _this.headers }),
				error: null
			};
		} catch (error) {
			if (_this.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Retrieves the details of an existing Storage bucket.
	*
	* @category File Buckets
	* @param id The unique identifier of the bucket you would like to retrieve.
	* @returns Promise with response containing bucket details or error
	*
	* @example Get bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .getBucket('avatars')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "id": "avatars",
	*     "name": "avatars",
	*     "owner": "",
	*     "public": false,
	*     "file_size_limit": 1024,
	*     "allowed_mime_types": [
	*       "image/png"
	*     ],
	*     "created_at": "2024-05-22T22:26:05.100Z",
	*     "updated_at": "2024-05-22T22:26:05.100Z"
	*   },
	*   "error": null
	* }
	* ```
	*/
	async getBucket(id) {
		var _this2 = this;
		try {
			return {
				data: await get(_this2.fetch, `${_this2.url}/bucket/${id}`, { headers: _this2.headers }),
				error: null
			};
		} catch (error) {
			if (_this2.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Creates a new Storage bucket
	*
	* @category File Buckets
	* @param id A unique identifier for the bucket you are creating.
	* @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations. By default, buckets are private.
	* @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
	* The global file size limit takes precedence over this value.
	* The default value is null, which doesn't set a per bucket file size limit.
	* @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
	* The default value is null, which allows files with all mime types to be uploaded.
	* Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
	* @param options.type (private-beta) specifies the bucket type. see `BucketType` for more details.
	*   - default bucket type is `STANDARD`
	* @returns Promise with response containing newly created bucket name or error
	*
	* @example Create bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .createBucket('avatars', {
	*     public: false,
	*     allowedMimeTypes: ['image/png'],
	*     fileSizeLimit: 1024
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "name": "avatars"
	*   },
	*   "error": null
	* }
	* ```
	*/
	async createBucket(id, options = { public: false }) {
		var _this3 = this;
		try {
			return {
				data: await post$1(_this3.fetch, `${_this3.url}/bucket`, {
					id,
					name: id,
					type: options.type,
					public: options.public,
					file_size_limit: options.fileSizeLimit,
					allowed_mime_types: options.allowedMimeTypes
				}, { headers: _this3.headers }),
				error: null
			};
		} catch (error) {
			if (_this3.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Updates a Storage bucket
	*
	* @category File Buckets
	* @param id A unique identifier for the bucket you are updating.
	* @param options.public The visibility of the bucket. Public buckets don't require an authorization token to download objects, but still require a valid token for all other operations.
	* @param options.fileSizeLimit specifies the max file size in bytes that can be uploaded to this bucket.
	* The global file size limit takes precedence over this value.
	* The default value is null, which doesn't set a per bucket file size limit.
	* @param options.allowedMimeTypes specifies the allowed mime types that this bucket can accept during upload.
	* The default value is null, which allows files with all mime types to be uploaded.
	* Each mime type specified can be a wildcard, e.g. image/*, or a specific mime type, e.g. image/png.
	* @returns Promise with response containing success message or error
	*
	* @example Update bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .updateBucket('avatars', {
	*     public: false,
	*     allowedMimeTypes: ['image/png'],
	*     fileSizeLimit: 1024
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully updated"
	*   },
	*   "error": null
	* }
	* ```
	*/
	async updateBucket(id, options) {
		var _this4 = this;
		try {
			return {
				data: await put(_this4.fetch, `${_this4.url}/bucket/${id}`, {
					id,
					name: id,
					public: options.public,
					file_size_limit: options.fileSizeLimit,
					allowed_mime_types: options.allowedMimeTypes
				}, { headers: _this4.headers }),
				error: null
			};
		} catch (error) {
			if (_this4.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Removes all objects inside a single bucket.
	*
	* @category File Buckets
	* @param id The unique identifier of the bucket you would like to empty.
	* @returns Promise with success message or error
	*
	* @example Empty bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .emptyBucket('avatars')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully emptied"
	*   },
	*   "error": null
	* }
	* ```
	*/
	async emptyBucket(id) {
		var _this5 = this;
		try {
			return {
				data: await post$1(_this5.fetch, `${_this5.url}/bucket/${id}/empty`, {}, { headers: _this5.headers }),
				error: null
			};
		} catch (error) {
			if (_this5.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
	* You must first `empty()` the bucket.
	*
	* @category File Buckets
	* @param id The unique identifier of the bucket you would like to delete.
	* @returns Promise with success message or error
	*
	* @example Delete bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .deleteBucket('avatars')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully deleted"
	*   },
	*   "error": null
	* }
	* ```
	*/
	async deleteBucket(id) {
		var _this6 = this;
		try {
			return {
				data: await remove(_this6.fetch, `${_this6.url}/bucket/${id}`, {}, { headers: _this6.headers }),
				error: null
			};
		} catch (error) {
			if (_this6.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	listBucketOptionsToQueryString(options) {
		const params = {};
		if (options) {
			if ("limit" in options) params.limit = String(options.limit);
			if ("offset" in options) params.offset = String(options.offset);
			if (options.search) params.search = options.search;
			if (options.sortColumn) params.sortColumn = options.sortColumn;
			if (options.sortOrder) params.sortOrder = options.sortOrder;
		}
		return Object.keys(params).length > 0 ? "?" + new URLSearchParams(params).toString() : "";
	}
};

//#endregion
//#region src/packages/StorageAnalyticsClient.ts
/**
* Client class for managing Analytics Buckets using Iceberg tables
* Provides methods for creating, listing, and deleting analytics buckets
*/
var StorageAnalyticsClient = class {
	/**
	* @alpha
	*
	* Creates a new StorageAnalyticsClient instance
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param url - The base URL for the storage API
	* @param headers - HTTP headers to include in requests
	* @param fetch - Optional custom fetch implementation
	*
	* @example
	* ```typescript
	* const client = new StorageAnalyticsClient(url, headers)
	* ```
	*/
	constructor(url, headers = {}, fetch$1) {
		this.shouldThrowOnError = false;
		this.url = url.replace(/\/$/, "");
		this.headers = _objectSpread2$1(_objectSpread2$1({}, DEFAULT_HEADERS$1$1), headers);
		this.fetch = resolveFetch$1$1(fetch$1);
	}
	/**
	* @alpha
	*
	* Enable throwing errors instead of returning them in the response
	* When enabled, failed operations will throw instead of returning { data: null, error }
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @returns This instance for method chaining
	*/
	throwOnError() {
		this.shouldThrowOnError = true;
		return this;
	}
	/**
	* @alpha
	*
	* Creates a new analytics bucket using Iceberg tables
	* Analytics buckets are optimized for analytical queries and data processing
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param name A unique name for the bucket you are creating
	* @returns Promise with response containing newly created analytics bucket or error
	*
	* @example Create analytics bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .analytics
	*   .createBucket('analytics-data')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "name": "analytics-data",
	*     "type": "ANALYTICS",
	*     "format": "iceberg",
	*     "created_at": "2024-05-22T22:26:05.100Z",
	*     "updated_at": "2024-05-22T22:26:05.100Z"
	*   },
	*   "error": null
	* }
	* ```
	*/
	async createBucket(name) {
		var _this = this;
		try {
			return {
				data: await post$1(_this.fetch, `${_this.url}/bucket`, { name }, { headers: _this.headers }),
				error: null
			};
		} catch (error) {
			if (_this.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* @alpha
	*
	* Retrieves the details of all Analytics Storage buckets within an existing project
	* Only returns buckets of type 'ANALYTICS'
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param options Query parameters for listing buckets
	* @param options.limit Maximum number of buckets to return
	* @param options.offset Number of buckets to skip
	* @param options.sortColumn Column to sort by ('name', 'created_at', 'updated_at')
	* @param options.sortOrder Sort order ('asc' or 'desc')
	* @param options.search Search term to filter bucket names
	* @returns Promise with response containing array of analytics buckets or error
	*
	* @example List analytics buckets
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .analytics
	*   .listBuckets({
	*     limit: 10,
	*     offset: 0,
	*     sortColumn: 'created_at',
	*     sortOrder: 'desc'
	*   })
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": [
	*     {
	*       "name": "analytics-data",
	*       "type": "ANALYTICS",
	*       "format": "iceberg",
	*       "created_at": "2024-05-22T22:26:05.100Z",
	*       "updated_at": "2024-05-22T22:26:05.100Z"
	*     }
	*   ],
	*   "error": null
	* }
	* ```
	*/
	async listBuckets(options) {
		var _this2 = this;
		try {
			const queryParams = new URLSearchParams();
			if ((options === null || options === void 0 ? void 0 : options.limit) !== void 0) queryParams.set("limit", options.limit.toString());
			if ((options === null || options === void 0 ? void 0 : options.offset) !== void 0) queryParams.set("offset", options.offset.toString());
			if (options === null || options === void 0 ? void 0 : options.sortColumn) queryParams.set("sortColumn", options.sortColumn);
			if (options === null || options === void 0 ? void 0 : options.sortOrder) queryParams.set("sortOrder", options.sortOrder);
			if (options === null || options === void 0 ? void 0 : options.search) queryParams.set("search", options.search);
			const queryString = queryParams.toString();
			const url = queryString ? `${_this2.url}/bucket?${queryString}` : `${_this2.url}/bucket`;
			return {
				data: await get(_this2.fetch, url, { headers: _this2.headers }),
				error: null
			};
		} catch (error) {
			if (_this2.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* @alpha
	*
	* Deletes an existing analytics bucket
	* A bucket can't be deleted with existing objects inside it
	* You must first empty the bucket before deletion
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param bucketName The unique identifier of the bucket you would like to delete
	* @returns Promise with response containing success message or error
	*
	* @example Delete analytics bucket
	* ```js
	* const { data, error } = await supabase
	*   .storage
	*   .analytics
	*   .deleteBucket('analytics-data')
	* ```
	*
	* Response:
	* ```json
	* {
	*   "data": {
	*     "message": "Successfully deleted"
	*   },
	*   "error": null
	* }
	* ```
	*/
	async deleteBucket(bucketName) {
		var _this3 = this;
		try {
			return {
				data: await remove(_this3.fetch, `${_this3.url}/bucket/${bucketName}`, {}, { headers: _this3.headers }),
				error: null
			};
		} catch (error) {
			if (_this3.shouldThrowOnError) throw error;
			if (isStorageError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/**
	* @alpha
	*
	* Get an Iceberg REST Catalog client configured for a specific analytics bucket
	* Use this to perform advanced table and namespace operations within the bucket
	* The returned client provides full access to the Apache Iceberg REST Catalog API
	* with the Supabase `{ data, error }` pattern for consistent error handling on all operations.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @param bucketName - The name of the analytics bucket (warehouse) to connect to
	* @returns The wrapped Iceberg catalog client
	* @throws {StorageError} If the bucket name is invalid
	*
	* @example Get catalog and create table
	* ```js
	* // First, create an analytics bucket
	* const { data: bucket, error: bucketError } = await supabase
	*   .storage
	*   .analytics
	*   .createBucket('analytics-data')
	*
	* // Get the Iceberg catalog for that bucket
	* const catalog = supabase.storage.analytics.from('analytics-data')
	*
	* // Create a namespace
	* const { error: nsError } = await catalog.createNamespace({ namespace: ['default'] })
	*
	* // Create a table with schema
	* const { data: tableMetadata, error: tableError } = await catalog.createTable(
	*   { namespace: ['default'] },
	*   {
	*     name: 'events',
	*     schema: {
	*       type: 'struct',
	*       fields: [
	*         { id: 1, name: 'id', type: 'long', required: true },
	*         { id: 2, name: 'timestamp', type: 'timestamp', required: true },
	*         { id: 3, name: 'user_id', type: 'string', required: false }
	*       ],
	*       'schema-id': 0,
	*       'identifier-field-ids': [1]
	*     },
	*     'partition-spec': {
	*       'spec-id': 0,
	*       fields: []
	*     },
	*     'write-order': {
	*       'order-id': 0,
	*       fields: []
	*     },
	*     properties: {
	*       'write.format.default': 'parquet'
	*     }
	*   }
	* )
	* ```
	*
	* @example List tables in namespace
	* ```js
	* const catalog = supabase.storage.analytics.from('analytics-data')
	*
	* // List all tables in the default namespace
	* const { data: tables, error: listError } = await catalog.listTables({ namespace: ['default'] })
	* if (listError) {
	*   if (listError.isNotFound()) {
	*     console.log('Namespace not found')
	*   }
	*   return
	* }
	* console.log(tables) // [{ namespace: ['default'], name: 'events' }]
	* ```
	*
	* @example Working with namespaces
	* ```js
	* const catalog = supabase.storage.analytics.from('analytics-data')
	*
	* // List all namespaces
	* const { data: namespaces } = await catalog.listNamespaces()
	*
	* // Create namespace with properties
	* await catalog.createNamespace(
	*   { namespace: ['production'] },
	*   { properties: { owner: 'data-team', env: 'prod' } }
	* )
	* ```
	*
	* @example Cleanup operations
	* ```js
	* const catalog = supabase.storage.analytics.from('analytics-data')
	*
	* // Drop table with purge option (removes all data)
	* const { error: dropError } = await catalog.dropTable(
	*   { namespace: ['default'], name: 'events' },
	*   { purge: true }
	* )
	*
	* if (dropError?.isNotFound()) {
	*   console.log('Table does not exist')
	* }
	*
	* // Drop namespace (must be empty)
	* await catalog.dropNamespace({ namespace: ['default'] })
	* ```
	*
	* @remarks
	* This method provides a bridge between Supabase's bucket management and the standard
	* Apache Iceberg REST Catalog API. The bucket name maps to the Iceberg warehouse parameter.
	* All authentication and configuration is handled automatically using your Supabase credentials.
	*
	* **Error Handling**: Invalid bucket names throw immediately. All catalog
	* operations return `{ data, error }` where errors are `IcebergError` instances from iceberg-js.
	* Use helper methods like `error.isNotFound()` or check `error.status` for specific error handling.
	* Use `.throwOnError()` on the analytics client if you prefer exceptions for catalog operations.
	*
	* **Cleanup Operations**: When using `dropTable`, the `purge: true` option permanently
	* deletes all table data. Without it, the table is marked as deleted but data remains.
	*
	* **Library Dependency**: The returned catalog wraps `IcebergRestCatalog` from iceberg-js.
	* For complete API documentation and advanced usage, refer to the
	* [iceberg-js documentation](https://supabase.github.io/iceberg-js/).
	*/
	from(bucketName) {
		var _this4 = this;
		if (!isValidBucketName(bucketName)) throw new StorageError("Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.");
		const catalog = new IcebergRestCatalog({
			baseUrl: this.url,
			catalogName: bucketName,
			auth: {
				type: "custom",
				getHeaders: async () => _this4.headers
			},
			fetch: this.fetch
		});
		const shouldThrowOnError = this.shouldThrowOnError;
		return new Proxy(catalog, { get(target, prop) {
			const value = target[prop];
			if (typeof value !== "function") return value;
			return async (...args) => {
				try {
					return {
						data: await value.apply(target, args),
						error: null
					};
				} catch (error) {
					if (shouldThrowOnError) throw error;
					return {
						data: null,
						error
					};
				}
			};
		} });
	}
};

//#endregion
//#region src/lib/vectors/constants.ts
const DEFAULT_HEADERS$2 = {
	"X-Client-Info": `storage-js/${version$2}`,
	"Content-Type": "application/json"
};

//#endregion
//#region src/lib/vectors/errors.ts
/**
* Base error class for all Storage Vectors errors
*/
var StorageVectorsError = class extends Error {
	constructor(message) {
		super(message);
		this.__isStorageVectorsError = true;
		this.name = "StorageVectorsError";
	}
};
/**
* Type guard to check if an error is a StorageVectorsError
* @param error - The error to check
* @returns True if the error is a StorageVectorsError
*/
function isStorageVectorsError(error) {
	return typeof error === "object" && error !== null && "__isStorageVectorsError" in error;
}
/**
* API error returned from S3 Vectors service
* Includes HTTP status code and service-specific error code
*/
var StorageVectorsApiError = class extends StorageVectorsError {
	constructor(message, status, statusCode) {
		super(message);
		this.name = "StorageVectorsApiError";
		this.status = status;
		this.statusCode = statusCode;
	}
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			status: this.status,
			statusCode: this.statusCode
		};
	}
};
/**
* Unknown error that doesn't match expected error patterns
* Wraps the original error for debugging
*/
var StorageVectorsUnknownError = class extends StorageVectorsError {
	constructor(message, originalError) {
		super(message);
		this.name = "StorageVectorsUnknownError";
		this.originalError = originalError;
	}
};

//#endregion
//#region src/lib/vectors/helpers.ts
/**
* Resolves the fetch implementation to use
* Uses custom fetch if provided, otherwise uses native fetch
*
* @param customFetch - Optional custom fetch implementation
* @returns Resolved fetch function
*/
const resolveFetch$2 = (customFetch) => {
	if (customFetch) return (...args) => customFetch(...args);
	return (...args) => fetch(...args);
};
/**
* Determine if input is a plain object
* An object is plain if it's created by either {}, new Object(), or Object.create(null)
*
* @param value - Value to check
* @returns True if value is a plain object
* @source https://github.com/sindresorhus/is-plain-obj
*/
const isPlainObject = (value) => {
	if (typeof value !== "object" || value === null) return false;
	const prototype = Object.getPrototypeOf(value);
	return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
};

//#endregion
//#region src/lib/vectors/fetch.ts
/**
* Extracts error message from various error response formats
* @param err - Error object from API
* @returns Human-readable error message
*/
const _getErrorMessage$2 = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
/**
* Handles fetch errors and converts them to StorageVectors error types
* @param error - The error caught from fetch
* @param reject - Promise rejection function
* @param options - Fetch options that may affect error handling
*/
const handleError$2 = async (error, reject, options) => {
	if (error && typeof error === "object" && "status" in error && "ok" in error && typeof error.status === "number" && !(options === null || options === void 0 ? void 0 : options.noResolveJson)) {
		const status = error.status || 500;
		const responseError = error;
		if (typeof responseError.json === "function") responseError.json().then((err) => {
			const statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || (err === null || err === void 0 ? void 0 : err.code) || status + "";
			reject(new StorageVectorsApiError(_getErrorMessage$2(err), status, statusCode));
		}).catch(() => {
			const statusCode = status + "";
			reject(new StorageVectorsApiError(responseError.statusText || `HTTP ${status} error`, status, statusCode));
		});
		else {
			const statusCode = status + "";
			reject(new StorageVectorsApiError(responseError.statusText || `HTTP ${status} error`, status, statusCode));
		}
	} else reject(new StorageVectorsUnknownError(_getErrorMessage$2(error), error));
};
/**
* Builds request parameters for fetch calls
* @param method - HTTP method
* @param options - Custom fetch options
* @param parameters - Additional fetch parameters like AbortSignal
* @param body - Request body (will be JSON stringified if plain object)
* @returns Complete fetch request parameters
*/
const _getRequestParams$2 = (method, options, parameters, body) => {
	const params = {
		method,
		headers: (options === null || options === void 0 ? void 0 : options.headers) || {}
	};
	if (!body) return params;
	if (isPlainObject(body)) {
		params.headers = _objectSpread2$1({ "Content-Type": "application/json" }, options === null || options === void 0 ? void 0 : options.headers);
		params.body = JSON.stringify(body);
	} else params.body = body;
	return _objectSpread2$1(_objectSpread2$1({}, params), parameters);
};
/**
* Internal request handler that wraps fetch with error handling
* @param fetcher - Fetch function to use
* @param method - HTTP method
* @param url - Request URL
* @param options - Custom fetch options
* @param parameters - Additional fetch parameters
* @param body - Request body
* @returns Promise with parsed response or error
*/
async function _handleRequest$2(fetcher, method, url, options, parameters, body) {
	return new Promise((resolve, reject) => {
		fetcher(url, _getRequestParams$2(method, options, parameters, body)).then((result) => {
			if (!result.ok) throw result;
			if (options === null || options === void 0 ? void 0 : options.noResolveJson) return result;
			const contentType = result.headers.get("content-type");
			if (!contentType || !contentType.includes("application/json")) return {};
			return result.json();
		}).then((data) => resolve(data)).catch((error) => handleError$2(error, reject, options));
	});
}
/**
* Performs a POST request
* @param fetcher - Fetch function to use
* @param url - Request URL
* @param body - Request body to be JSON stringified
* @param options - Custom fetch options
* @param parameters - Additional fetch parameters
* @returns Promise with parsed response
*/
async function post(fetcher, url, body, options, parameters) {
	return _handleRequest$2(fetcher, "POST", url, options, parameters, body);
}

//#endregion
//#region src/lib/vectors/VectorIndexApi.ts
/**
* @hidden
* Base implementation for vector index operations.
* Use {@link VectorBucketScope} via `supabase.storage.vectors.from('bucket')` instead.
*/
var VectorIndexApi = class {
	/** Creates a new VectorIndexApi instance */
	constructor(url, headers = {}, fetch$1) {
		this.shouldThrowOnError = false;
		this.url = url.replace(/\/$/, "");
		this.headers = _objectSpread2$1(_objectSpread2$1({}, DEFAULT_HEADERS$2), headers);
		this.fetch = resolveFetch$2(fetch$1);
	}
	/** Enable throwing errors instead of returning them in the response */
	throwOnError() {
		this.shouldThrowOnError = true;
		return this;
	}
	/** Creates a new vector index within a bucket */
	async createIndex(options) {
		var _this = this;
		try {
			return {
				data: await post(_this.fetch, `${_this.url}/CreateIndex`, options, { headers: _this.headers }) || {},
				error: null
			};
		} catch (error) {
			if (_this.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/** Retrieves metadata for a specific vector index */
	async getIndex(vectorBucketName, indexName) {
		var _this2 = this;
		try {
			return {
				data: await post(_this2.fetch, `${_this2.url}/GetIndex`, {
					vectorBucketName,
					indexName
				}, { headers: _this2.headers }),
				error: null
			};
		} catch (error) {
			if (_this2.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/** Lists vector indexes within a bucket with optional filtering and pagination */
	async listIndexes(options) {
		var _this3 = this;
		try {
			return {
				data: await post(_this3.fetch, `${_this3.url}/ListIndexes`, options, { headers: _this3.headers }),
				error: null
			};
		} catch (error) {
			if (_this3.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/** Deletes a vector index and all its data */
	async deleteIndex(vectorBucketName, indexName) {
		var _this4 = this;
		try {
			return {
				data: await post(_this4.fetch, `${_this4.url}/DeleteIndex`, {
					vectorBucketName,
					indexName
				}, { headers: _this4.headers }) || {},
				error: null
			};
		} catch (error) {
			if (_this4.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
};

//#endregion
//#region src/lib/vectors/VectorDataApi.ts
/**
* @hidden
* Base implementation for vector data operations.
* Use {@link VectorIndexScope} via `supabase.storage.vectors.from('bucket').index('idx')` instead.
*/
var VectorDataApi = class {
	/** Creates a new VectorDataApi instance */
	constructor(url, headers = {}, fetch$1) {
		this.shouldThrowOnError = false;
		this.url = url.replace(/\/$/, "");
		this.headers = _objectSpread2$1(_objectSpread2$1({}, DEFAULT_HEADERS$2), headers);
		this.fetch = resolveFetch$2(fetch$1);
	}
	/** Enable throwing errors instead of returning them in the response */
	throwOnError() {
		this.shouldThrowOnError = true;
		return this;
	}
	/** Inserts or updates vectors in batch (1-500 per request) */
	async putVectors(options) {
		var _this = this;
		try {
			if (options.vectors.length < 1 || options.vectors.length > 500) throw new Error("Vector batch size must be between 1 and 500 items");
			return {
				data: await post(_this.fetch, `${_this.url}/PutVectors`, options, { headers: _this.headers }) || {},
				error: null
			};
		} catch (error) {
			if (_this.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/** Retrieves vectors by their keys in batch */
	async getVectors(options) {
		var _this2 = this;
		try {
			return {
				data: await post(_this2.fetch, `${_this2.url}/GetVectors`, options, { headers: _this2.headers }),
				error: null
			};
		} catch (error) {
			if (_this2.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/** Lists vectors in an index with pagination */
	async listVectors(options) {
		var _this3 = this;
		try {
			if (options.segmentCount !== void 0) {
				if (options.segmentCount < 1 || options.segmentCount > 16) throw new Error("segmentCount must be between 1 and 16");
				if (options.segmentIndex !== void 0) {
					if (options.segmentIndex < 0 || options.segmentIndex >= options.segmentCount) throw new Error(`segmentIndex must be between 0 and ${options.segmentCount - 1}`);
				}
			}
			return {
				data: await post(_this3.fetch, `${_this3.url}/ListVectors`, options, { headers: _this3.headers }),
				error: null
			};
		} catch (error) {
			if (_this3.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/** Queries for similar vectors using approximate nearest neighbor search */
	async queryVectors(options) {
		var _this4 = this;
		try {
			return {
				data: await post(_this4.fetch, `${_this4.url}/QueryVectors`, options, { headers: _this4.headers }),
				error: null
			};
		} catch (error) {
			if (_this4.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/** Deletes vectors by their keys in batch (1-500 per request) */
	async deleteVectors(options) {
		var _this5 = this;
		try {
			if (options.keys.length < 1 || options.keys.length > 500) throw new Error("Keys batch size must be between 1 and 500 items");
			return {
				data: await post(_this5.fetch, `${_this5.url}/DeleteVectors`, options, { headers: _this5.headers }) || {},
				error: null
			};
		} catch (error) {
			if (_this5.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
};

//#endregion
//#region src/lib/vectors/VectorBucketApi.ts
/**
* @hidden
* Base implementation for vector bucket operations.
* Use {@link StorageVectorsClient} via `supabase.storage.vectors` instead.
*/
var VectorBucketApi = class {
	/** Creates a new VectorBucketApi instance */
	constructor(url, headers = {}, fetch$1) {
		this.shouldThrowOnError = false;
		this.url = url.replace(/\/$/, "");
		this.headers = _objectSpread2$1(_objectSpread2$1({}, DEFAULT_HEADERS$2), headers);
		this.fetch = resolveFetch$2(fetch$1);
	}
	/** Enable throwing errors instead of returning them in the response */
	throwOnError() {
		this.shouldThrowOnError = true;
		return this;
	}
	/** Creates a new vector bucket */
	async createBucket(vectorBucketName) {
		var _this = this;
		try {
			return {
				data: await post(_this.fetch, `${_this.url}/CreateVectorBucket`, { vectorBucketName }, { headers: _this.headers }) || {},
				error: null
			};
		} catch (error) {
			if (_this.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/** Retrieves metadata for a specific vector bucket */
	async getBucket(vectorBucketName) {
		var _this2 = this;
		try {
			return {
				data: await post(_this2.fetch, `${_this2.url}/GetVectorBucket`, { vectorBucketName }, { headers: _this2.headers }),
				error: null
			};
		} catch (error) {
			if (_this2.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/** Lists vector buckets with optional filtering and pagination */
	async listBuckets(options = {}) {
		var _this3 = this;
		try {
			return {
				data: await post(_this3.fetch, `${_this3.url}/ListVectorBuckets`, options, { headers: _this3.headers }),
				error: null
			};
		} catch (error) {
			if (_this3.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
	/** Deletes a vector bucket (must be empty first) */
	async deleteBucket(vectorBucketName) {
		var _this4 = this;
		try {
			return {
				data: await post(_this4.fetch, `${_this4.url}/DeleteVectorBucket`, { vectorBucketName }, { headers: _this4.headers }) || {},
				error: null
			};
		} catch (error) {
			if (_this4.shouldThrowOnError) throw error;
			if (isStorageVectorsError(error)) return {
				data: null,
				error
			};
			throw error;
		}
	}
};

//#endregion
//#region src/lib/vectors/StorageVectorsClient.ts
/**
*
* @alpha
*
* Main client for interacting with S3 Vectors API
* Provides access to bucket, index, and vector data operations
*
* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
*
* **Usage Patterns:**
*
* ```typescript
* const { data, error } = await supabase
*  .storage
*  .vectors
*  .createBucket('embeddings-prod')
*
* // Access index operations via buckets
* const bucket = supabase.storage.vectors.from('embeddings-prod')
* await bucket.createIndex({
*   indexName: 'documents',
*   dataType: 'float32',
*   dimension: 1536,
*   distanceMetric: 'cosine'
* })
*
* // Access vector operations via index
* const index = bucket.index('documents')
* await index.putVectors({
*   vectors: [
*     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
*   ]
* })
*
* // Query similar vectors
* const { data } = await index.queryVectors({
*   queryVector: { float32: [...] },
*   topK: 5,
*   returnDistance: true
* })
* ```
*/
var StorageVectorsClient = class extends VectorBucketApi {
	/**
	* @alpha
	*
	* Creates a StorageVectorsClient that can manage buckets, indexes, and vectors.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param url - Base URL of the Storage Vectors REST API.
	* @param options.headers - Optional headers (for example `Authorization`) applied to every request.
	* @param options.fetch - Optional custom `fetch` implementation for non-browser runtimes.
	*
	* @example
	* ```typescript
	* const client = new StorageVectorsClient(url, options)
	* ```
	*/
	constructor(url, options = {}) {
		super(url, options.headers || {}, options.fetch);
	}
	/**
	*
	* @alpha
	*
	* Access operations for a specific vector bucket
	* Returns a scoped client for index and vector operations within the bucket
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param vectorBucketName - Name of the vector bucket
	* @returns Bucket-scoped client with index and vector operations
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* ```
	*/
	from(vectorBucketName) {
		return new VectorBucketScope(this.url, this.headers, vectorBucketName, this.fetch);
	}
	/**
	*
	* @alpha
	*
	* Creates a new vector bucket
	* Vector buckets are containers for vector indexes and their data
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param vectorBucketName - Unique name for the vector bucket
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const { data, error } = await supabase
	*   .storage
	*   .vectors
	*   .createBucket('embeddings-prod')
	* ```
	*/
	async createBucket(vectorBucketName) {
		var _superprop_getCreateBucket = () => super.createBucket, _this = this;
		return _superprop_getCreateBucket().call(_this, vectorBucketName);
	}
	/**
	*
	* @alpha
	*
	* Retrieves metadata for a specific vector bucket
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param vectorBucketName - Name of the vector bucket
	* @returns Promise with bucket metadata or error
	*
	* @example
	* ```typescript
	* const { data, error } = await supabase
	*   .storage
	*   .vectors
	*   .getBucket('embeddings-prod')
	*
	* console.log('Bucket created:', data?.vectorBucket.creationTime)
	* ```
	*/
	async getBucket(vectorBucketName) {
		var _superprop_getGetBucket = () => super.getBucket, _this2 = this;
		return _superprop_getGetBucket().call(_this2, vectorBucketName);
	}
	/**
	*
	* @alpha
	*
	* Lists all vector buckets with optional filtering and pagination
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Optional filters (prefix, maxResults, nextToken)
	* @returns Promise with list of buckets or error
	*
	* @example
	* ```typescript
	* const { data, error } = await supabase
	*   .storage
	*   .vectors
	*   .listBuckets({ prefix: 'embeddings-' })
	*
	* data?.vectorBuckets.forEach(bucket => {
	*   console.log(bucket.vectorBucketName)
	* })
	* ```
	*/
	async listBuckets(options = {}) {
		var _superprop_getListBuckets = () => super.listBuckets, _this3 = this;
		return _superprop_getListBuckets().call(_this3, options);
	}
	/**
	*
	* @alpha
	*
	* Deletes a vector bucket (bucket must be empty)
	* All indexes must be deleted before deleting the bucket
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param vectorBucketName - Name of the vector bucket to delete
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const { data, error } = await supabase
	*   .storage
	*   .vectors
	*   .deleteBucket('embeddings-old')
	* ```
	*/
	async deleteBucket(vectorBucketName) {
		var _superprop_getDeleteBucket = () => super.deleteBucket, _this4 = this;
		return _superprop_getDeleteBucket().call(_this4, vectorBucketName);
	}
};
/**
*
* @alpha
*
* Scoped client for operations within a specific vector bucket
* Provides index management and access to vector operations
*
* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
*/
var VectorBucketScope = class extends VectorIndexApi {
	/**
	* @alpha
	*
	* Creates a helper that automatically scopes all index operations to the provided bucket.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* ```
	*/
	constructor(url, headers, vectorBucketName, fetch$1) {
		super(url, headers, fetch$1);
		this.vectorBucketName = vectorBucketName;
	}
	/**
	*
	* @alpha
	*
	* Creates a new vector index in this bucket
	* Convenience method that automatically includes the bucket name
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Index configuration (vectorBucketName is automatically set)
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* await bucket.createIndex({
	*   indexName: 'documents-openai',
	*   dataType: 'float32',
	*   dimension: 1536,
	*   distanceMetric: 'cosine',
	*   metadataConfiguration: {
	*     nonFilterableMetadataKeys: ['raw_text']
	*   }
	* })
	* ```
	*/
	async createIndex(options) {
		var _superprop_getCreateIndex = () => super.createIndex, _this5 = this;
		return _superprop_getCreateIndex().call(_this5, _objectSpread2$1(_objectSpread2$1({}, options), {}, { vectorBucketName: _this5.vectorBucketName }));
	}
	/**
	*
	* @alpha
	*
	* Lists indexes in this bucket
	* Convenience method that automatically includes the bucket name
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Listing options (vectorBucketName is automatically set)
	* @returns Promise with response containing indexes array and pagination token or error
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* const { data } = await bucket.listIndexes({ prefix: 'documents-' })
	* ```
	*/
	async listIndexes(options = {}) {
		var _superprop_getListIndexes = () => super.listIndexes, _this6 = this;
		return _superprop_getListIndexes().call(_this6, _objectSpread2$1(_objectSpread2$1({}, options), {}, { vectorBucketName: _this6.vectorBucketName }));
	}
	/**
	*
	* @alpha
	*
	* Retrieves metadata for a specific index in this bucket
	* Convenience method that automatically includes the bucket name
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param indexName - Name of the index to retrieve
	* @returns Promise with index metadata or error
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* const { data } = await bucket.getIndex('documents-openai')
	* console.log('Dimension:', data?.index.dimension)
	* ```
	*/
	async getIndex(indexName) {
		var _superprop_getGetIndex = () => super.getIndex, _this7 = this;
		return _superprop_getGetIndex().call(_this7, _this7.vectorBucketName, indexName);
	}
	/**
	*
	* @alpha
	*
	* Deletes an index from this bucket
	* Convenience method that automatically includes the bucket name
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param indexName - Name of the index to delete
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const bucket = supabase.storage.vectors.from('embeddings-prod')
	* await bucket.deleteIndex('old-index')
	* ```
	*/
	async deleteIndex(indexName) {
		var _superprop_getDeleteIndex = () => super.deleteIndex, _this8 = this;
		return _superprop_getDeleteIndex().call(_this8, _this8.vectorBucketName, indexName);
	}
	/**
	*
	* @alpha
	*
	* Access operations for a specific index within this bucket
	* Returns a scoped client for vector data operations
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param indexName - Name of the index
	* @returns Index-scoped client with vector data operations
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	*
	* // Insert vectors
	* await index.putVectors({
	*   vectors: [
	*     { key: 'doc-1', data: { float32: [...] }, metadata: { title: 'Intro' } }
	*   ]
	* })
	*
	* // Query similar vectors
	* const { data } = await index.queryVectors({
	*   queryVector: { float32: [...] },
	*   topK: 5
	* })
	* ```
	*/
	index(indexName) {
		return new VectorIndexScope(this.url, this.headers, this.vectorBucketName, indexName, this.fetch);
	}
};
/**
*
* @alpha
*
* Scoped client for operations within a specific vector index
* Provides vector data operations (put, get, list, query, delete)
*
* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
*/
var VectorIndexScope = class extends VectorDataApi {
	/**
	*
	* @alpha
	*
	* Creates a helper that automatically scopes all vector operations to the provided bucket/index names.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* ```
	*/
	constructor(url, headers, vectorBucketName, indexName, fetch$1) {
		super(url, headers, fetch$1);
		this.vectorBucketName = vectorBucketName;
		this.indexName = indexName;
	}
	/**
	*
	* @alpha
	*
	* Inserts or updates vectors in this index
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Vector insertion options (bucket and index names automatically set)
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* await index.putVectors({
	*   vectors: [
	*     {
	*       key: 'doc-1',
	*       data: { float32: [0.1, 0.2, ...] },
	*       metadata: { title: 'Introduction', page: 1 }
	*     }
	*   ]
	* })
	* ```
	*/
	async putVectors(options) {
		var _superprop_getPutVectors = () => super.putVectors, _this9 = this;
		return _superprop_getPutVectors().call(_this9, _objectSpread2$1(_objectSpread2$1({}, options), {}, {
			vectorBucketName: _this9.vectorBucketName,
			indexName: _this9.indexName
		}));
	}
	/**
	*
	* @alpha
	*
	* Retrieves vectors by keys from this index
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Vector retrieval options (bucket and index names automatically set)
	* @returns Promise with response containing vectors array or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* const { data } = await index.getVectors({
	*   keys: ['doc-1', 'doc-2'],
	*   returnMetadata: true
	* })
	* ```
	*/
	async getVectors(options) {
		var _superprop_getGetVectors = () => super.getVectors, _this10 = this;
		return _superprop_getGetVectors().call(_this10, _objectSpread2$1(_objectSpread2$1({}, options), {}, {
			vectorBucketName: _this10.vectorBucketName,
			indexName: _this10.indexName
		}));
	}
	/**
	*
	* @alpha
	*
	* Lists vectors in this index with pagination
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Listing options (bucket and index names automatically set)
	* @returns Promise with response containing vectors array and pagination token or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* const { data } = await index.listVectors({
	*   maxResults: 500,
	*   returnMetadata: true
	* })
	* ```
	*/
	async listVectors(options = {}) {
		var _superprop_getListVectors = () => super.listVectors, _this11 = this;
		return _superprop_getListVectors().call(_this11, _objectSpread2$1(_objectSpread2$1({}, options), {}, {
			vectorBucketName: _this11.vectorBucketName,
			indexName: _this11.indexName
		}));
	}
	/**
	*
	* @alpha
	*
	* Queries for similar vectors in this index
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Query options (bucket and index names automatically set)
	* @returns Promise with response containing matches array of similar vectors ordered by distance or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* const { data } = await index.queryVectors({
	*   queryVector: { float32: [0.1, 0.2, ...] },
	*   topK: 5,
	*   filter: { category: 'technical' },
	*   returnDistance: true,
	*   returnMetadata: true
	* })
	* ```
	*/
	async queryVectors(options) {
		var _superprop_getQueryVectors = () => super.queryVectors, _this12 = this;
		return _superprop_getQueryVectors().call(_this12, _objectSpread2$1(_objectSpread2$1({}, options), {}, {
			vectorBucketName: _this12.vectorBucketName,
			indexName: _this12.indexName
		}));
	}
	/**
	*
	* @alpha
	*
	* Deletes vectors by keys from this index
	* Convenience method that automatically includes bucket and index names
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @param options - Deletion options (bucket and index names automatically set)
	* @returns Promise with empty response on success or error
	*
	* @example
	* ```typescript
	* const index = supabase.storage.vectors.from('embeddings-prod').index('documents-openai')
	* await index.deleteVectors({
	*   keys: ['doc-1', 'doc-2', 'doc-3']
	* })
	* ```
	*/
	async deleteVectors(options) {
		var _superprop_getDeleteVectors = () => super.deleteVectors, _this13 = this;
		return _superprop_getDeleteVectors().call(_this13, _objectSpread2$1(_objectSpread2$1({}, options), {}, {
			vectorBucketName: _this13.vectorBucketName,
			indexName: _this13.indexName
		}));
	}
};

//#endregion
//#region src/StorageClient.ts
var StorageClient = class extends StorageBucketApi {
	/**
	* Creates a client for Storage buckets, files, analytics, and vectors.
	*
	* @category File Buckets
	* @example
	* ```ts
	* import { StorageClient } from '@supabase/storage-js'
	*
	* const storage = new StorageClient('https://xyzcompany.supabase.co/storage/v1', {
	*   apikey: 'public-anon-key',
	* })
	* const avatars = storage.from('avatars')
	* ```
	*/
	constructor(url, headers = {}, fetch$1, opts) {
		super(url, headers, fetch$1, opts);
	}
	/**
	* Perform file operation in a bucket.
	*
	* @category File Buckets
	* @param id The bucket id to operate on.
	*
	* @example
	* ```typescript
	* const avatars = supabase.storage.from('avatars')
	* ```
	*/
	from(id) {
		return new StorageFileApi(this.url, this.headers, id, this.fetch);
	}
	/**
	*
	* @alpha
	*
	* Access vector storage operations.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Vector Buckets
	* @returns A StorageVectorsClient instance configured with the current storage settings.
	*/
	get vectors() {
		return new StorageVectorsClient(this.url + "/vector", {
			headers: this.headers,
			fetch: this.fetch
		});
	}
	/**
	*
	* @alpha
	*
	* Access analytics storage operations using Iceberg tables.
	*
	* **Public alpha:** This API is part of a public alpha release and may not be available to your account type.
	*
	* @category Analytics Buckets
	* @returns A StorageAnalyticsClient instance configured with the current storage settings.
	*/
	get analytics() {
		return new StorageAnalyticsClient(this.url + "/iceberg", this.headers, this.fetch);
	}
};

// Generated automatically during releases by scripts/update-version-files.ts
// This file provides runtime access to the package version for:
// - HTTP request headers (e.g., X-Client-Info header for API requests)
// - Debugging and support (identifying which version is running)
// - Telemetry and logging (version reporting in errors/analytics)
// - Ensuring build artifacts match the published package version
const version$1 = '2.91.1';

/** Current session will be checked for refresh at this interval. */
const AUTO_REFRESH_TICK_DURATION_MS = 30 * 1000;
/**
 * A token refresh will be attempted this many ticks before the current session expires. */
const AUTO_REFRESH_TICK_THRESHOLD = 3;
/*
 * Earliest time before an access token expires that the session should be refreshed.
 */
const EXPIRY_MARGIN_MS = AUTO_REFRESH_TICK_THRESHOLD * AUTO_REFRESH_TICK_DURATION_MS;
const GOTRUE_URL = 'http://localhost:9999';
const STORAGE_KEY = 'supabase.auth.token';
const DEFAULT_HEADERS$1 = { 'X-Client-Info': `gotrue-js/${version$1}` };
const API_VERSION_HEADER_NAME = 'X-Supabase-Api-Version';
const API_VERSIONS = {
    '2024-01-01': {
        timestamp: Date.parse('2024-01-01T00:00:00.0Z'),
        name: '2024-01-01',
    },
};
const BASE64URL_REGEX = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;
const JWKS_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Base error thrown by Supabase Auth helpers.
 *
 * @example
 * ```ts
 * import { AuthError } from '@supabase/auth-js'
 *
 * throw new AuthError('Unexpected auth error', 500, 'unexpected')
 * ```
 */
class AuthError extends Error {
    constructor(message, status, code) {
        super(message);
        this.__isAuthError = true;
        this.name = 'AuthError';
        this.status = status;
        this.code = code;
    }
}
function isAuthError(error) {
    return typeof error === 'object' && error !== null && '__isAuthError' in error;
}
/**
 * Error returned directly from the GoTrue REST API.
 *
 * @example
 * ```ts
 * import { AuthApiError } from '@supabase/auth-js'
 *
 * throw new AuthApiError('Invalid credentials', 400, 'invalid_credentials')
 * ```
 */
class AuthApiError extends AuthError {
    constructor(message, status, code) {
        super(message, status, code);
        this.name = 'AuthApiError';
        this.status = status;
        this.code = code;
    }
}
function isAuthApiError(error) {
    return isAuthError(error) && error.name === 'AuthApiError';
}
/**
 * Wraps non-standard errors so callers can inspect the root cause.
 *
 * @example
 * ```ts
 * import { AuthUnknownError } from '@supabase/auth-js'
 *
 * try {
 *   await someAuthCall()
 * } catch (err) {
 *   throw new AuthUnknownError('Auth failed', err)
 * }
 * ```
 */
class AuthUnknownError extends AuthError {
    constructor(message, originalError) {
        super(message);
        this.name = 'AuthUnknownError';
        this.originalError = originalError;
    }
}
/**
 * Flexible error class used to create named auth errors at runtime.
 *
 * @example
 * ```ts
 * import { CustomAuthError } from '@supabase/auth-js'
 *
 * throw new CustomAuthError('My custom auth error', 'MyAuthError', 400, 'custom_code')
 * ```
 */
class CustomAuthError extends AuthError {
    constructor(message, name, status, code) {
        super(message, status, code);
        this.name = name;
        this.status = status;
    }
}
/**
 * Error thrown when an operation requires a session but none is present.
 *
 * @example
 * ```ts
 * import { AuthSessionMissingError } from '@supabase/auth-js'
 *
 * throw new AuthSessionMissingError()
 * ```
 */
class AuthSessionMissingError extends CustomAuthError {
    constructor() {
        super('Auth session missing!', 'AuthSessionMissingError', 400, undefined);
    }
}
function isAuthSessionMissingError(error) {
    return isAuthError(error) && error.name === 'AuthSessionMissingError';
}
/**
 * Error thrown when the token response is malformed.
 *
 * @example
 * ```ts
 * import { AuthInvalidTokenResponseError } from '@supabase/auth-js'
 *
 * throw new AuthInvalidTokenResponseError()
 * ```
 */
class AuthInvalidTokenResponseError extends CustomAuthError {
    constructor() {
        super('Auth session or user missing', 'AuthInvalidTokenResponseError', 500, undefined);
    }
}
/**
 * Error thrown when email/password credentials are invalid.
 *
 * @example
 * ```ts
 * import { AuthInvalidCredentialsError } from '@supabase/auth-js'
 *
 * throw new AuthInvalidCredentialsError('Email or password is incorrect')
 * ```
 */
class AuthInvalidCredentialsError extends CustomAuthError {
    constructor(message) {
        super(message, 'AuthInvalidCredentialsError', 400, undefined);
    }
}
/**
 * Error thrown when implicit grant redirects contain an error.
 *
 * @example
 * ```ts
 * import { AuthImplicitGrantRedirectError } from '@supabase/auth-js'
 *
 * throw new AuthImplicitGrantRedirectError('OAuth redirect failed', {
 *   error: 'access_denied',
 *   code: 'oauth_error',
 * })
 * ```
 */
class AuthImplicitGrantRedirectError extends CustomAuthError {
    constructor(message, details = null) {
        super(message, 'AuthImplicitGrantRedirectError', 500, undefined);
        this.details = null;
        this.details = details;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            details: this.details,
        };
    }
}
function isAuthImplicitGrantRedirectError(error) {
    return isAuthError(error) && error.name === 'AuthImplicitGrantRedirectError';
}
/**
 * Error thrown during PKCE code exchanges.
 *
 * @example
 * ```ts
 * import { AuthPKCEGrantCodeExchangeError } from '@supabase/auth-js'
 *
 * throw new AuthPKCEGrantCodeExchangeError('PKCE exchange failed')
 * ```
 */
class AuthPKCEGrantCodeExchangeError extends CustomAuthError {
    constructor(message, details = null) {
        super(message, 'AuthPKCEGrantCodeExchangeError', 500, undefined);
        this.details = null;
        this.details = details;
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            details: this.details,
        };
    }
}
/**
 * Error thrown when the PKCE code verifier is not found in storage.
 * This typically happens when the auth flow was initiated in a different
 * browser, device, or the storage was cleared.
 *
 * @example
 * ```ts
 * import { AuthPKCECodeVerifierMissingError } from '@supabase/auth-js'
 *
 * throw new AuthPKCECodeVerifierMissingError()
 * ```
 */
class AuthPKCECodeVerifierMissingError extends CustomAuthError {
    constructor() {
        super('PKCE code verifier not found in storage. ' +
            'This can happen if the auth flow was initiated in a different browser or device, ' +
            'or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), ' +
            'use @supabase/ssr on both the server and client to store the code verifier in cookies.', 'AuthPKCECodeVerifierMissingError', 400, 'pkce_code_verifier_not_found');
    }
}
/**
 * Error thrown when a transient fetch issue occurs.
 *
 * @example
 * ```ts
 * import { AuthRetryableFetchError } from '@supabase/auth-js'
 *
 * throw new AuthRetryableFetchError('Service temporarily unavailable', 503)
 * ```
 */
class AuthRetryableFetchError extends CustomAuthError {
    constructor(message, status) {
        super(message, 'AuthRetryableFetchError', status, undefined);
    }
}
function isAuthRetryableFetchError(error) {
    return isAuthError(error) && error.name === 'AuthRetryableFetchError';
}
/**
 * This error is thrown on certain methods when the password used is deemed
 * weak. Inspect the reasons to identify what password strength rules are
 * inadequate.
 */
/**
 * Error thrown when a supplied password is considered weak.
 *
 * @example
 * ```ts
 * import { AuthWeakPasswordError } from '@supabase/auth-js'
 *
 * throw new AuthWeakPasswordError('Password too short', 400, ['min_length'])
 * ```
 */
class AuthWeakPasswordError extends CustomAuthError {
    constructor(message, status, reasons) {
        super(message, 'AuthWeakPasswordError', status, 'weak_password');
        this.reasons = reasons;
    }
}
/**
 * Error thrown when a JWT cannot be verified or parsed.
 *
 * @example
 * ```ts
 * import { AuthInvalidJwtError } from '@supabase/auth-js'
 *
 * throw new AuthInvalidJwtError('Token signature is invalid')
 * ```
 */
class AuthInvalidJwtError extends CustomAuthError {
    constructor(message) {
        super(message, 'AuthInvalidJwtError', 400, 'invalid_jwt');
    }
}

/**
 * Avoid modifying this file. It's part of
 * https://github.com/supabase-community/base64url-js.  Submit all fixes on
 * that repo!
 */
/**
 * An array of characters that encode 6 bits into a Base64-URL alphabet
 * character.
 */
const TO_BASE64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('');
/**
 * An array of characters that can appear in a Base64-URL encoded string but
 * should be ignored.
 */
const IGNORE_BASE64URL = ' \t\n\r='.split('');
/**
 * An array of 128 numbers that map a Base64-URL character to 6 bits, or if -2
 * used to skip the character, or if -1 used to error out.
 */
const FROM_BASE64URL = (() => {
    const charMap = new Array(128);
    for (let i = 0; i < charMap.length; i += 1) {
        charMap[i] = -1;
    }
    for (let i = 0; i < IGNORE_BASE64URL.length; i += 1) {
        charMap[IGNORE_BASE64URL[i].charCodeAt(0)] = -2;
    }
    for (let i = 0; i < TO_BASE64URL.length; i += 1) {
        charMap[TO_BASE64URL[i].charCodeAt(0)] = i;
    }
    return charMap;
})();
/**
 * Converts a byte to a Base64-URL string.
 *
 * @param byte The byte to convert, or null to flush at the end of the byte sequence.
 * @param state The Base64 conversion state. Pass an initial value of `{ queue: 0, queuedBits: 0 }`.
 * @param emit A function called with the next Base64 character when ready.
 */
function byteToBase64URL(byte, state, emit) {
    if (byte !== null) {
        state.queue = (state.queue << 8) | byte;
        state.queuedBits += 8;
        while (state.queuedBits >= 6) {
            const pos = (state.queue >> (state.queuedBits - 6)) & 63;
            emit(TO_BASE64URL[pos]);
            state.queuedBits -= 6;
        }
    }
    else if (state.queuedBits > 0) {
        state.queue = state.queue << (6 - state.queuedBits);
        state.queuedBits = 6;
        while (state.queuedBits >= 6) {
            const pos = (state.queue >> (state.queuedBits - 6)) & 63;
            emit(TO_BASE64URL[pos]);
            state.queuedBits -= 6;
        }
    }
}
/**
 * Converts a String char code (extracted using `string.charCodeAt(position)`) to a sequence of Base64-URL characters.
 *
 * @param charCode The char code of the JavaScript string.
 * @param state The Base64 state. Pass an initial value of `{ queue: 0, queuedBits: 0 }`.
 * @param emit A function called with the next byte.
 */
function byteFromBase64URL(charCode, state, emit) {
    const bits = FROM_BASE64URL[charCode];
    if (bits > -1) {
        // valid Base64-URL character
        state.queue = (state.queue << 6) | bits;
        state.queuedBits += 6;
        while (state.queuedBits >= 8) {
            emit((state.queue >> (state.queuedBits - 8)) & 0xff);
            state.queuedBits -= 8;
        }
    }
    else if (bits === -2) {
        // ignore spaces, tabs, newlines, =
        return;
    }
    else {
        throw new Error(`Invalid Base64-URL character "${String.fromCharCode(charCode)}"`);
    }
}
/**
 * Converts a Base64-URL encoded string into a JavaScript string. It is assumed
 * that the underlying string has been encoded as UTF-8.
 *
 * @param str The Base64-URL encoded string.
 */
function stringFromBase64URL(str) {
    const conv = [];
    const utf8Emit = (codepoint) => {
        conv.push(String.fromCodePoint(codepoint));
    };
    const utf8State = {
        utf8seq: 0,
        codepoint: 0,
    };
    const b64State = { queue: 0, queuedBits: 0 };
    const byteEmit = (byte) => {
        stringFromUTF8(byte, utf8State, utf8Emit);
    };
    for (let i = 0; i < str.length; i += 1) {
        byteFromBase64URL(str.charCodeAt(i), b64State, byteEmit);
    }
    return conv.join('');
}
/**
 * Converts a Unicode codepoint to a multi-byte UTF-8 sequence.
 *
 * @param codepoint The Unicode codepoint.
 * @param emit      Function which will be called for each UTF-8 byte that represents the codepoint.
 */
function codepointToUTF8(codepoint, emit) {
    if (codepoint <= 0x7f) {
        emit(codepoint);
        return;
    }
    else if (codepoint <= 0x7ff) {
        emit(0xc0 | (codepoint >> 6));
        emit(0x80 | (codepoint & 0x3f));
        return;
    }
    else if (codepoint <= 0xffff) {
        emit(0xe0 | (codepoint >> 12));
        emit(0x80 | ((codepoint >> 6) & 0x3f));
        emit(0x80 | (codepoint & 0x3f));
        return;
    }
    else if (codepoint <= 0x10ffff) {
        emit(0xf0 | (codepoint >> 18));
        emit(0x80 | ((codepoint >> 12) & 0x3f));
        emit(0x80 | ((codepoint >> 6) & 0x3f));
        emit(0x80 | (codepoint & 0x3f));
        return;
    }
    throw new Error(`Unrecognized Unicode codepoint: ${codepoint.toString(16)}`);
}
/**
 * Converts a JavaScript string to a sequence of UTF-8 bytes.
 *
 * @param str  The string to convert to UTF-8.
 * @param emit Function which will be called for each UTF-8 byte of the string.
 */
function stringToUTF8(str, emit) {
    for (let i = 0; i < str.length; i += 1) {
        let codepoint = str.charCodeAt(i);
        if (codepoint > 0xd7ff && codepoint <= 0xdbff) {
            // most UTF-16 codepoints are Unicode codepoints, except values in this
            // range where the next UTF-16 codepoint needs to be combined with the
            // current one to get the Unicode codepoint
            const highSurrogate = ((codepoint - 0xd800) * 0x400) & 0xffff;
            const lowSurrogate = (str.charCodeAt(i + 1) - 0xdc00) & 0xffff;
            codepoint = (lowSurrogate | highSurrogate) + 0x10000;
            i += 1;
        }
        codepointToUTF8(codepoint, emit);
    }
}
/**
 * Converts a UTF-8 byte to a Unicode codepoint.
 *
 * @param byte  The UTF-8 byte next in the sequence.
 * @param state The shared state between consecutive UTF-8 bytes in the
 *              sequence, an object with the shape `{ utf8seq: 0, codepoint: 0 }`.
 * @param emit  Function which will be called for each codepoint.
 */
function stringFromUTF8(byte, state, emit) {
    if (state.utf8seq === 0) {
        if (byte <= 0x7f) {
            emit(byte);
            return;
        }
        // count the number of 1 leading bits until you reach 0
        for (let leadingBit = 1; leadingBit < 6; leadingBit += 1) {
            if (((byte >> (7 - leadingBit)) & 1) === 0) {
                state.utf8seq = leadingBit;
                break;
            }
        }
        if (state.utf8seq === 2) {
            state.codepoint = byte & 31;
        }
        else if (state.utf8seq === 3) {
            state.codepoint = byte & 15;
        }
        else if (state.utf8seq === 4) {
            state.codepoint = byte & 7;
        }
        else {
            throw new Error('Invalid UTF-8 sequence');
        }
        state.utf8seq -= 1;
    }
    else if (state.utf8seq > 0) {
        if (byte <= 0x7f) {
            throw new Error('Invalid UTF-8 sequence');
        }
        state.codepoint = (state.codepoint << 6) | (byte & 63);
        state.utf8seq -= 1;
        if (state.utf8seq === 0) {
            emit(state.codepoint);
        }
    }
}
/**
 * Helper functions to convert different types of strings to Uint8Array
 */
function base64UrlToUint8Array(str) {
    const result = [];
    const state = { queue: 0, queuedBits: 0 };
    const onByte = (byte) => {
        result.push(byte);
    };
    for (let i = 0; i < str.length; i += 1) {
        byteFromBase64URL(str.charCodeAt(i), state, onByte);
    }
    return new Uint8Array(result);
}
function stringToUint8Array(str) {
    const result = [];
    stringToUTF8(str, (byte) => result.push(byte));
    return new Uint8Array(result);
}
function bytesToBase64URL(bytes) {
    const result = [];
    const state = { queue: 0, queuedBits: 0 };
    const onChar = (char) => {
        result.push(char);
    };
    bytes.forEach((byte) => byteToBase64URL(byte, state, onChar));
    // always call with `null` after processing all bytes
    byteToBase64URL(null, state, onChar);
    return result.join('');
}

function expiresAt(expiresIn) {
    const timeNow = Math.round(Date.now() / 1000);
    return timeNow + expiresIn;
}
/**
 * Generates a unique identifier for internal callback subscriptions.
 *
 * This function uses JavaScript Symbols to create guaranteed-unique identifiers
 * for auth state change callbacks. Symbols are ideal for this use case because:
 * - They are guaranteed unique by the JavaScript runtime
 * - They work in all environments (browser, SSR, Node.js)
 * - They avoid issues with Next.js 16 deterministic rendering requirements
 * - They are perfect for internal, non-serializable identifiers
 *
 * Note: This function is only used for internal subscription management,
 * not for security-critical operations like session tokens.
 */
function generateCallbackId() {
    return Symbol('auth-callback');
}
const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';
const localStorageWriteTests = {
    tested: false,
    writable: false,
};
/**
 * Checks whether localStorage is supported on this browser.
 */
const supportsLocalStorage = () => {
    if (!isBrowser()) {
        return false;
    }
    try {
        if (typeof globalThis.localStorage !== 'object') {
            return false;
        }
    }
    catch (e) {
        // DOM exception when accessing `localStorage`
        return false;
    }
    if (localStorageWriteTests.tested) {
        return localStorageWriteTests.writable;
    }
    const randomKey = `lswt-${Math.random()}${Math.random()}`;
    try {
        globalThis.localStorage.setItem(randomKey, randomKey);
        globalThis.localStorage.removeItem(randomKey);
        localStorageWriteTests.tested = true;
        localStorageWriteTests.writable = true;
    }
    catch (e) {
        // localStorage can't be written to
        // https://www.chromium.org/for-testers/bug-reporting-guidelines/uncaught-securityerror-failed-to-read-the-localstorage-property-from-window-access-is-denied-for-this-document
        localStorageWriteTests.tested = true;
        localStorageWriteTests.writable = false;
    }
    return localStorageWriteTests.writable;
};
/**
 * Extracts parameters encoded in the URL both in the query and fragment.
 */
function parseParametersFromURL(href) {
    const result = {};
    const url = new URL(href);
    if (url.hash && url.hash[0] === '#') {
        try {
            const hashSearchParams = new URLSearchParams(url.hash.substring(1));
            hashSearchParams.forEach((value, key) => {
                result[key] = value;
            });
        }
        catch (e) {
            // hash is not a query string
        }
    }
    // search parameters take precedence over hash parameters
    url.searchParams.forEach((value, key) => {
        result[key] = value;
    });
    return result;
}
const resolveFetch$1 = (customFetch) => {
    if (customFetch) {
        return (...args) => customFetch(...args);
    }
    return (...args) => fetch(...args);
};
const looksLikeFetchResponse = (maybeResponse) => {
    return (typeof maybeResponse === 'object' &&
        maybeResponse !== null &&
        'status' in maybeResponse &&
        'ok' in maybeResponse &&
        'json' in maybeResponse &&
        typeof maybeResponse.json === 'function');
};
// Storage helpers
const setItemAsync = async (storage, key, data) => {
    await storage.setItem(key, JSON.stringify(data));
};
const getItemAsync = async (storage, key) => {
    const value = await storage.getItem(key);
    if (!value) {
        return null;
    }
    try {
        return JSON.parse(value);
    }
    catch (_a) {
        return value;
    }
};
const removeItemAsync = async (storage, key) => {
    await storage.removeItem(key);
};
/**
 * A deferred represents some asynchronous work that is not yet finished, which
 * may or may not culminate in a value.
 * Taken from: https://github.com/mike-north/types/blob/master/src/async.ts
 */
class Deferred {
    constructor() {
        this.promise = new Deferred.promiseConstructor((res, rej) => {
            this.resolve = res;
            this.reject = rej;
        });
    }
}
Deferred.promiseConstructor = Promise;
function decodeJWT(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new AuthInvalidJwtError('Invalid JWT structure');
    }
    // Regex checks for base64url format
    for (let i = 0; i < parts.length; i++) {
        if (!BASE64URL_REGEX.test(parts[i])) {
            throw new AuthInvalidJwtError('JWT not in base64url format');
        }
    }
    const data = {
        // using base64url lib
        header: JSON.parse(stringFromBase64URL(parts[0])),
        payload: JSON.parse(stringFromBase64URL(parts[1])),
        signature: base64UrlToUint8Array(parts[2]),
        raw: {
            header: parts[0],
            payload: parts[1],
        },
    };
    return data;
}
/**
 * Creates a promise that resolves to null after some time.
 */
async function sleep(time) {
    return await new Promise((accept) => {
        setTimeout(() => accept(null), time);
    });
}
/**
 * Converts the provided async function into a retryable function. Each result
 * or thrown error is sent to the isRetryable function which should return true
 * if the function should run again.
 */
function retryable(fn, isRetryable) {
    const promise = new Promise((accept, reject) => {
        (async () => {
            for (let attempt = 0; attempt < Infinity; attempt++) {
                try {
                    const result = await fn(attempt);
                    if (!isRetryable(attempt, null, result)) {
                        accept(result);
                        return;
                    }
                }
                catch (e) {
                    if (!isRetryable(attempt, e)) {
                        reject(e);
                        return;
                    }
                }
            }
        })();
    });
    return promise;
}
function dec2hex(dec) {
    return ('0' + dec.toString(16)).substr(-2);
}
// Functions below taken from: https://stackoverflow.com/questions/63309409/creating-a-code-verifier-and-challenge-for-pkce-auth-on-spotify-api-in-reactjs
function generatePKCEVerifier() {
    const verifierLength = 56;
    const array = new Uint32Array(verifierLength);
    if (typeof crypto === 'undefined') {
        const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        const charSetLen = charSet.length;
        let verifier = '';
        for (let i = 0; i < verifierLength; i++) {
            verifier += charSet.charAt(Math.floor(Math.random() * charSetLen));
        }
        return verifier;
    }
    crypto.getRandomValues(array);
    return Array.from(array, dec2hex).join('');
}
async function sha256(randomString) {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(randomString);
    const hash = await crypto.subtle.digest('SHA-256', encodedData);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes)
        .map((c) => String.fromCharCode(c))
        .join('');
}
async function generatePKCEChallenge(verifier) {
    const hasCryptoSupport = typeof crypto !== 'undefined' &&
        typeof crypto.subtle !== 'undefined' &&
        typeof TextEncoder !== 'undefined';
    if (!hasCryptoSupport) {
        console.warn('WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256.');
        return verifier;
    }
    const hashed = await sha256(verifier);
    return btoa(hashed).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function getCodeChallengeAndMethod(storage, storageKey, isPasswordRecovery = false) {
    const codeVerifier = generatePKCEVerifier();
    let storedCodeVerifier = codeVerifier;
    if (isPasswordRecovery) {
        storedCodeVerifier += '/PASSWORD_RECOVERY';
    }
    await setItemAsync(storage, `${storageKey}-code-verifier`, storedCodeVerifier);
    const codeChallenge = await generatePKCEChallenge(codeVerifier);
    const codeChallengeMethod = codeVerifier === codeChallenge ? 'plain' : 's256';
    return [codeChallenge, codeChallengeMethod];
}
/** Parses the API version which is 2YYY-MM-DD. */
const API_VERSION_REGEX = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
function parseResponseAPIVersion(response) {
    const apiVersion = response.headers.get(API_VERSION_HEADER_NAME);
    if (!apiVersion) {
        return null;
    }
    if (!apiVersion.match(API_VERSION_REGEX)) {
        return null;
    }
    try {
        const date = new Date(`${apiVersion}T00:00:00.0Z`);
        return date;
    }
    catch (e) {
        return null;
    }
}
function validateExp(exp) {
    if (!exp) {
        throw new Error('Missing exp claim');
    }
    const timeNow = Math.floor(Date.now() / 1000);
    if (exp <= timeNow) {
        throw new Error('JWT has expired');
    }
}
function getAlgorithm(alg) {
    switch (alg) {
        case 'RS256':
            return {
                name: 'RSASSA-PKCS1-v1_5',
                hash: { name: 'SHA-256' },
            };
        case 'ES256':
            return {
                name: 'ECDSA',
                namedCurve: 'P-256',
                hash: { name: 'SHA-256' },
            };
        default:
            throw new Error('Invalid alg claim');
    }
}
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
function validateUUID(str) {
    if (!UUID_REGEX.test(str)) {
        throw new Error('@supabase/auth-js: Expected parameter to be UUID but is not');
    }
}
function userNotAvailableProxy() {
    const proxyTarget = {};
    return new Proxy(proxyTarget, {
        get: (target, prop) => {
            if (prop === '__isUserNotAvailableProxy') {
                return true;
            }
            // Preventative check for common problematic symbols during cloning/inspection
            // These symbols might be accessed by structuredClone or other internal mechanisms.
            if (typeof prop === 'symbol') {
                const sProp = prop.toString();
                if (sProp === 'Symbol(Symbol.toPrimitive)' ||
                    sProp === 'Symbol(Symbol.toStringTag)' ||
                    sProp === 'Symbol(util.inspect.custom)') {
                    // Node.js util.inspect
                    return undefined;
                }
            }
            throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${prop}" property of the session object is not supported. Please use getUser() instead.`);
        },
        set: (_target, prop) => {
            throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
        },
        deleteProperty: (_target, prop) => {
            throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${prop}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
        },
    });
}
/**
 * Creates a proxy around a user object that warns when properties are accessed on the server.
 * This is used to alert developers that using user data from getSession() on the server is insecure.
 *
 * @param user The actual user object to wrap
 * @param suppressWarningRef An object with a 'value' property that controls warning suppression
 * @returns A proxied user object that warns on property access
 */
function insecureUserWarningProxy(user, suppressWarningRef) {
    return new Proxy(user, {
        get: (target, prop, receiver) => {
            // Allow internal checks without warning
            if (prop === '__isInsecureUserWarningProxy') {
                return true;
            }
            // Preventative check for common problematic symbols during cloning/inspection
            // These symbols might be accessed by structuredClone or other internal mechanisms
            if (typeof prop === 'symbol') {
                const sProp = prop.toString();
                if (sProp === 'Symbol(Symbol.toPrimitive)' ||
                    sProp === 'Symbol(Symbol.toStringTag)' ||
                    sProp === 'Symbol(util.inspect.custom)' ||
                    sProp === 'Symbol(nodejs.util.inspect.custom)') {
                    // Return the actual value for these symbols to allow proper inspection
                    return Reflect.get(target, prop, receiver);
                }
            }
            // Emit warning on first property access
            if (!suppressWarningRef.value && typeof prop === 'string') {
                console.warn('Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server.');
                suppressWarningRef.value = true;
            }
            return Reflect.get(target, prop, receiver);
        },
    });
}
/**
 * Deep clones a JSON-serializable object using JSON.parse(JSON.stringify(obj)).
 * Note: Only works for JSON-safe data.
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

const _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
const NETWORK_ERROR_CODES = [502, 503, 504];
async function handleError(error) {
    var _a;
    if (!looksLikeFetchResponse(error)) {
        throw new AuthRetryableFetchError(_getErrorMessage(error), 0);
    }
    if (NETWORK_ERROR_CODES.includes(error.status)) {
        // status in 500...599 range - server had an error, request might be retryed.
        throw new AuthRetryableFetchError(_getErrorMessage(error), error.status);
    }
    let data;
    try {
        data = await error.json();
    }
    catch (e) {
        throw new AuthUnknownError(_getErrorMessage(e), e);
    }
    let errorCode = undefined;
    const responseAPIVersion = parseResponseAPIVersion(error);
    if (responseAPIVersion &&
        responseAPIVersion.getTime() >= API_VERSIONS['2024-01-01'].timestamp &&
        typeof data === 'object' &&
        data &&
        typeof data.code === 'string') {
        errorCode = data.code;
    }
    else if (typeof data === 'object' && data && typeof data.error_code === 'string') {
        errorCode = data.error_code;
    }
    if (!errorCode) {
        // Legacy support for weak password errors, when there were no error codes
        if (typeof data === 'object' &&
            data &&
            typeof data.weak_password === 'object' &&
            data.weak_password &&
            Array.isArray(data.weak_password.reasons) &&
            data.weak_password.reasons.length &&
            data.weak_password.reasons.reduce((a, i) => a && typeof i === 'string', true)) {
            throw new AuthWeakPasswordError(_getErrorMessage(data), error.status, data.weak_password.reasons);
        }
    }
    else if (errorCode === 'weak_password') {
        throw new AuthWeakPasswordError(_getErrorMessage(data), error.status, ((_a = data.weak_password) === null || _a === void 0 ? void 0 : _a.reasons) || []);
    }
    else if (errorCode === 'session_not_found') {
        // The `session_id` inside the JWT does not correspond to a row in the
        // `sessions` table. This usually means the user has signed out, has been
        // deleted, or their session has somehow been terminated.
        throw new AuthSessionMissingError();
    }
    throw new AuthApiError(_getErrorMessage(data), error.status || 500, errorCode);
}
const _getRequestParams = (method, options, parameters, body) => {
    const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
    if (method === 'GET') {
        return params;
    }
    params.headers = Object.assign({ 'Content-Type': 'application/json;charset=UTF-8' }, options === null || options === void 0 ? void 0 : options.headers);
    params.body = JSON.stringify(body);
    return Object.assign(Object.assign({}, params), parameters);
};
async function _request(fetcher, method, url, options) {
    var _a;
    const headers = Object.assign({}, options === null || options === void 0 ? void 0 : options.headers);
    if (!headers[API_VERSION_HEADER_NAME]) {
        headers[API_VERSION_HEADER_NAME] = API_VERSIONS['2024-01-01'].name;
    }
    if (options === null || options === void 0 ? void 0 : options.jwt) {
        headers['Authorization'] = `Bearer ${options.jwt}`;
    }
    const qs = (_a = options === null || options === void 0 ? void 0 : options.query) !== null && _a !== void 0 ? _a : {};
    if (options === null || options === void 0 ? void 0 : options.redirectTo) {
        qs['redirect_to'] = options.redirectTo;
    }
    const queryString = Object.keys(qs).length ? '?' + new URLSearchParams(qs).toString() : '';
    const data = await _handleRequest(fetcher, method, url + queryString, {
        headers,
        noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson,
    }, {}, options === null || options === void 0 ? void 0 : options.body);
    return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : { data: Object.assign({}, data), error: null };
}
async function _handleRequest(fetcher, method, url, options, parameters, body) {
    const requestParams = _getRequestParams(method, options, parameters, body);
    let result;
    try {
        result = await fetcher(url, Object.assign({}, requestParams));
    }
    catch (e) {
        console.error(e);
        // fetch failed, likely due to a network or CORS error
        throw new AuthRetryableFetchError(_getErrorMessage(e), 0);
    }
    if (!result.ok) {
        await handleError(result);
    }
    if (options === null || options === void 0 ? void 0 : options.noResolveJson) {
        return result;
    }
    try {
        return await result.json();
    }
    catch (e) {
        await handleError(e);
    }
}
function _sessionResponse(data) {
    var _a;
    let session = null;
    if (hasSession(data)) {
        session = Object.assign({}, data);
        if (!data.expires_at) {
            session.expires_at = expiresAt(data.expires_in);
        }
    }
    const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
    return { data: { session, user }, error: null };
}
function _sessionResponsePassword(data) {
    const response = _sessionResponse(data);
    if (!response.error &&
        data.weak_password &&
        typeof data.weak_password === 'object' &&
        Array.isArray(data.weak_password.reasons) &&
        data.weak_password.reasons.length &&
        data.weak_password.message &&
        typeof data.weak_password.message === 'string' &&
        data.weak_password.reasons.reduce((a, i) => a && typeof i === 'string', true)) {
        response.data.weak_password = data.weak_password;
    }
    return response;
}
function _userResponse(data) {
    var _a;
    const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
    return { data: { user }, error: null };
}
function _ssoResponse(data) {
    return { data, error: null };
}
function _generateLinkResponse(data) {
    const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data, rest = __rest(data, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]);
    const properties = {
        action_link,
        email_otp,
        hashed_token,
        redirect_to,
        verification_type,
    };
    const user = Object.assign({}, rest);
    return {
        data: {
            properties,
            user,
        },
        error: null,
    };
}
function _noResolveJsonResponse(data) {
    return data;
}
/**
 * hasSession checks if the response object contains a valid session
 * @param data A response object
 * @returns true if a session is in the response
 */
function hasSession(data) {
    return data.access_token && data.refresh_token && data.expires_in;
}

const SIGN_OUT_SCOPES = ['global', 'local', 'others'];

class GoTrueAdminApi {
  /**
   * Creates an admin API client that can be used to manage users and OAuth clients.
   *
   * @example
   * ```ts
   * import { GoTrueAdminApi } from '@supabase/auth-js'
   *
   * const admin = new GoTrueAdminApi({
   *   url: 'https://xyzcompany.supabase.co/auth/v1',
   *   headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
   * })
   * ```
   */
  constructor({ url = "", headers = {}, fetch }) {
    this.url = url;
    this.headers = headers;
    this.fetch = resolveFetch$1(fetch);
    this.mfa = {
      listFactors: this._listFactors.bind(this),
      deleteFactor: this._deleteFactor.bind(this)
    };
    this.oauth = {
      listClients: this._listOAuthClients.bind(this),
      createClient: this._createOAuthClient.bind(this),
      getClient: this._getOAuthClient.bind(this),
      updateClient: this._updateOAuthClient.bind(this),
      deleteClient: this._deleteOAuthClient.bind(this),
      regenerateClientSecret: this._regenerateOAuthClientSecret.bind(this)
    };
  }
  /**
   * Removes a logged-in session.
   * @param jwt A valid, logged-in JWT.
   * @param scope The logout sope.
   */
  async signOut(jwt, scope = SIGN_OUT_SCOPES[0]) {
    if (SIGN_OUT_SCOPES.indexOf(scope) < 0) {
      throw new Error(`@supabase/auth-js: Parameter scope must be one of ${SIGN_OUT_SCOPES.join(", ")}`);
    }
    try {
      await _request(this.fetch, "POST", `${this.url}/logout?scope=${scope}`, {
        headers: this.headers,
        jwt,
        noResolveJson: true
      });
      return { data: null, error: null };
    } catch (error) {
      if (isAuthError(error)) {
        return { data: null, error };
      }
      throw error;
    }
  }
  /**
   * Sends an invite link to an email address.
   * @param email The email address of the user.
   * @param options Additional options to be included when inviting.
   */
  async inviteUserByEmail(email, options = {}) {
    try {
      return await _request(this.fetch, "POST", `${this.url}/invite`, {
        body: { email, data: options.data },
        headers: this.headers,
        redirectTo: options.redirectTo,
        xform: _userResponse
      });
    } catch (error) {
      if (isAuthError(error)) {
        return { data: { user: null }, error };
      }
      throw error;
    }
  }
  /**
   * Generates email links and OTPs to be sent via a custom email provider.
   * @param email The user's email.
   * @param options.password User password. For signup only.
   * @param options.data Optional user metadata. For signup only.
   * @param options.redirectTo The redirect url which should be appended to the generated link
   */
  async generateLink(params) {
    try {
      const { options } = params, rest = __rest(params, ["options"]);
      const body = Object.assign(Object.assign({}, rest), options);
      if ("newEmail" in rest) {
        body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
        delete body["newEmail"];
      }
      return await _request(this.fetch, "POST", `${this.url}/admin/generate_link`, {
        body,
        headers: this.headers,
        xform: _generateLinkResponse,
        redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo
      });
    } catch (error) {
      if (isAuthError(error)) {
        return {
          data: {
            properties: null,
            user: null
          },
          error
        };
      }
      throw error;
    }
  }
  // User Admin API
  /**
   * Creates a new user.
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async createUser(attributes) {
    try {
      return await _request(this.fetch, "POST", `${this.url}/admin/users`, {
        body: attributes,
        headers: this.headers,
        xform: _userResponse
      });
    } catch (error) {
      if (isAuthError(error)) {
        return { data: { user: null }, error };
      }
      throw error;
    }
  }
  /**
   * Get a list of users.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   * @param params An object which supports `page` and `perPage` as numbers, to alter the paginated results.
   */
  async listUsers(params) {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
      const pagination = { nextPage: null, lastPage: 0, total: 0 };
      const response = await _request(this.fetch, "GET", `${this.url}/admin/users`, {
        headers: this.headers,
        noResolveJson: true,
        query: {
          page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "",
          per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""
        },
        xform: _noResolveJsonResponse
      });
      if (response.error)
        throw response.error;
      const users = await response.json();
      const total = (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0;
      const links = (_g = (_f = response.headers.get("link")) === null || _f === void 0 ? void 0 : _f.split(",")) !== null && _g !== void 0 ? _g : [];
      if (links.length > 0) {
        links.forEach((link) => {
          const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1));
          const rel = JSON.parse(link.split(";")[1].split("=")[1]);
          pagination[`${rel}Page`] = page;
        });
        pagination.total = parseInt(total);
      }
      return { data: Object.assign(Object.assign({}, users), pagination), error: null };
    } catch (error) {
      if (isAuthError(error)) {
        return { data: { users: [] }, error };
      }
      throw error;
    }
  }
  /**
   * Get user by id.
   *
   * @param uid The user's unique identifier
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async getUserById(uid) {
    validateUUID(uid);
    try {
      return await _request(this.fetch, "GET", `${this.url}/admin/users/${uid}`, {
        headers: this.headers,
        xform: _userResponse
      });
    } catch (error) {
      if (isAuthError(error)) {
        return { data: { user: null }, error };
      }
      throw error;
    }
  }
  /**
   * Updates the user data. Changes are applied directly without confirmation flows.
   *
   * @param attributes The data you want to update.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async updateUserById(uid, attributes) {
    validateUUID(uid);
    try {
      return await _request(this.fetch, "PUT", `${this.url}/admin/users/${uid}`, {
        body: attributes,
        headers: this.headers,
        xform: _userResponse
      });
    } catch (error) {
      if (isAuthError(error)) {
        return { data: { user: null }, error };
      }
      throw error;
    }
  }
  /**
   * Delete a user. Requires a `service_role` key.
   *
   * @param id The user id you want to remove.
   * @param shouldSoftDelete If true, then the user will be soft-deleted from the auth schema. Soft deletion allows user identification from the hashed user ID but is not reversible.
   * Defaults to false for backward compatibility.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async deleteUser(id, shouldSoftDelete = false) {
    validateUUID(id);
    try {
      return await _request(this.fetch, "DELETE", `${this.url}/admin/users/${id}`, {
        headers: this.headers,
        body: {
          should_soft_delete: shouldSoftDelete
        },
        xform: _userResponse
      });
    } catch (error) {
      if (isAuthError(error)) {
        return { data: { user: null }, error };
      }
      throw error;
    }
  }
  async _listFactors(params) {
    validateUUID(params.userId);
    try {
      const { data, error } = await _request(this.fetch, "GET", `${this.url}/admin/users/${params.userId}/factors`, {
        headers: this.headers,
        xform: (factors) => {
          return { data: { factors }, error: null };
        }
      });
      return { data, error };
    } catch (error) {
      if (isAuthError(error)) {
        return { data: null, error };
      }
      throw error;
    }
  }
  async _deleteFactor(params) {
    validateUUID(params.userId);
    validateUUID(params.id);
    try {
      const data = await _request(this.fetch, "DELETE", `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
        headers: this.headers
      });
      return { data, error: null };
    } catch (error) {
      if (isAuthError(error)) {
        return { data: null, error };
      }
      throw error;
    }
  }
  /**
   * Lists all OAuth clients with optional pagination.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async _listOAuthClients(params) {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
      const pagination = { nextPage: null, lastPage: 0, total: 0 };
      const response = await _request(this.fetch, "GET", `${this.url}/admin/oauth/clients`, {
        headers: this.headers,
        noResolveJson: true,
        query: {
          page: (_b = (_a = params === null || params === void 0 ? void 0 : params.page) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "",
          per_page: (_d = (_c = params === null || params === void 0 ? void 0 : params.perPage) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""
        },
        xform: _noResolveJsonResponse
      });
      if (response.error)
        throw response.error;
      const clients = await response.json();
      const total = (_e = response.headers.get("x-total-count")) !== null && _e !== void 0 ? _e : 0;
      const links = (_g = (_f = response.headers.get("link")) === null || _f === void 0 ? void 0 : _f.split(",")) !== null && _g !== void 0 ? _g : [];
      if (links.length > 0) {
        links.forEach((link) => {
          const page = parseInt(link.split(";")[0].split("=")[1].substring(0, 1));
          const rel = JSON.parse(link.split(";")[1].split("=")[1]);
          pagination[`${rel}Page`] = page;
        });
        pagination.total = parseInt(total);
      }
      return { data: Object.assign(Object.assign({}, clients), pagination), error: null };
    } catch (error) {
      if (isAuthError(error)) {
        return { data: { clients: [] }, error };
      }
      throw error;
    }
  }
  /**
   * Creates a new OAuth client.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async _createOAuthClient(params) {
    try {
      return await _request(this.fetch, "POST", `${this.url}/admin/oauth/clients`, {
        body: params,
        headers: this.headers,
        xform: (client) => {
          return { data: client, error: null };
        }
      });
    } catch (error) {
      if (isAuthError(error)) {
        return { data: null, error };
      }
      throw error;
    }
  }
  /**
   * Gets details of a specific OAuth client.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async _getOAuthClient(clientId) {
    try {
      return await _request(this.fetch, "GET", `${this.url}/admin/oauth/clients/${clientId}`, {
        headers: this.headers,
        xform: (client) => {
          return { data: client, error: null };
        }
      });
    } catch (error) {
      if (isAuthError(error)) {
        return { data: null, error };
      }
      throw error;
    }
  }
  /**
   * Updates an existing OAuth client.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async _updateOAuthClient(clientId, params) {
    try {
      return await _request(this.fetch, "PUT", `${this.url}/admin/oauth/clients/${clientId}`, {
        body: params,
        headers: this.headers,
        xform: (client) => {
          return { data: client, error: null };
        }
      });
    } catch (error) {
      if (isAuthError(error)) {
        return { data: null, error };
      }
      throw error;
    }
  }
  /**
   * Deletes an OAuth client.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async _deleteOAuthClient(clientId) {
    try {
      await _request(this.fetch, "DELETE", `${this.url}/admin/oauth/clients/${clientId}`, {
        headers: this.headers,
        noResolveJson: true
      });
      return { data: null, error: null };
    } catch (error) {
      if (isAuthError(error)) {
        return { data: null, error };
      }
      throw error;
    }
  }
  /**
   * Regenerates the secret for an OAuth client.
   * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
   *
   * This function should only be called on a server. Never expose your `service_role` key in the browser.
   */
  async _regenerateOAuthClientSecret(clientId) {
    try {
      return await _request(this.fetch, "POST", `${this.url}/admin/oauth/clients/${clientId}/regenerate_secret`, {
        headers: this.headers,
        xform: (client) => {
          return { data: client, error: null };
        }
      });
    } catch (error) {
      if (isAuthError(error)) {
        return { data: null, error };
      }
      throw error;
    }
  }
}

/**
 * Returns a localStorage-like object that stores the key-value pairs in
 * memory.
 */
function memoryLocalStorageAdapter(store = {}) {
    return {
        getItem: (key) => {
            return store[key] || null;
        },
        setItem: (key, value) => {
            store[key] = value;
        },
        removeItem: (key) => {
            delete store[key];
        },
    };
}

/**
 * @experimental
 */
const internals = {
    /**
     * @experimental
     */
    debug: !!(globalThis &&
        supportsLocalStorage() &&
        globalThis.localStorage &&
        globalThis.localStorage.getItem('supabase.gotrue-js.locks.debug') === 'true'),
};
/**
 * An error thrown when a lock cannot be acquired after some amount of time.
 *
 * Use the {@link #isAcquireTimeout} property instead of checking with `instanceof`.
 *
 * @example
 * ```ts
 * import { LockAcquireTimeoutError } from '@supabase/auth-js'
 *
 * class CustomLockError extends LockAcquireTimeoutError {
 *   constructor() {
 *     super('Lock timed out')
 *   }
 * }
 * ```
 */
class LockAcquireTimeoutError extends Error {
    constructor(message) {
        super(message);
        this.isAcquireTimeout = true;
    }
}
/**
 * Error thrown when the browser Navigator Lock API fails to acquire a lock.
 *
 * @example
 * ```ts
 * import { NavigatorLockAcquireTimeoutError } from '@supabase/auth-js'
 *
 * throw new NavigatorLockAcquireTimeoutError('Lock timed out')
 * ```
 */
class NavigatorLockAcquireTimeoutError extends LockAcquireTimeoutError {
}
/**
 * Implements a global exclusive lock using the Navigator LockManager API. It
 * is available on all browsers released after 2022-03-15 with Safari being the
 * last one to release support. If the API is not available, this function will
 * throw. Make sure you check availablility before configuring {@link
 * GoTrueClient}.
 *
 * You can turn on debugging by setting the `supabase.gotrue-js.locks.debug`
 * local storage item to `true`.
 *
 * Internals:
 *
 * Since the LockManager API does not preserve stack traces for the async
 * function passed in the `request` method, a trick is used where acquiring the
 * lock releases a previously started promise to run the operation in the `fn`
 * function. The lock waits for that promise to finish (with or without error),
 * while the function will finally wait for the result anyway.
 *
 * @param name Name of the lock to be acquired.
 * @param acquireTimeout If negative, no timeout. If 0 an error is thrown if
 *                       the lock can't be acquired without waiting. If positive, the lock acquire
 *                       will time out after so many milliseconds. An error is
 *                       a timeout if it has `isAcquireTimeout` set to true.
 * @param fn The operation to run once the lock is acquired.
 * @example
 * ```ts
 * await navigatorLock('sync-user', 1000, async () => {
 *   await refreshSession()
 * })
 * ```
 */
async function navigatorLock(name, acquireTimeout, fn) {
    if (internals.debug) {
        console.log('@supabase/gotrue-js: navigatorLock: acquire lock', name, acquireTimeout);
    }
    const abortController = new globalThis.AbortController();
    if (acquireTimeout > 0) {
        setTimeout(() => {
            abortController.abort();
            if (internals.debug) {
                console.log('@supabase/gotrue-js: navigatorLock acquire timed out', name);
            }
        }, acquireTimeout);
    }
    // MDN article: https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request
    // Wrapping navigator.locks.request() with a plain Promise is done as some
    // libraries like zone.js patch the Promise object to track the execution
    // context. However, it appears that most browsers use an internal promise
    // implementation when using the navigator.locks.request() API causing them
    // to lose context and emit confusing log messages or break certain features.
    // This wrapping is believed to help zone.js track the execution context
    // better.
    return await Promise.resolve().then(() => globalThis.navigator.locks.request(name, acquireTimeout === 0
        ? {
            mode: 'exclusive',
            ifAvailable: true,
        }
        : {
            mode: 'exclusive',
            signal: abortController.signal,
        }, async (lock) => {
        if (lock) {
            if (internals.debug) {
                console.log('@supabase/gotrue-js: navigatorLock: acquired', name, lock.name);
            }
            try {
                return await fn();
            }
            finally {
                if (internals.debug) {
                    console.log('@supabase/gotrue-js: navigatorLock: released', name, lock.name);
                }
            }
        }
        else {
            if (acquireTimeout === 0) {
                if (internals.debug) {
                    console.log('@supabase/gotrue-js: navigatorLock: not immediately available', name);
                }
                throw new NavigatorLockAcquireTimeoutError(`Acquiring an exclusive Navigator LockManager lock "${name}" immediately failed`);
            }
            else {
                if (internals.debug) {
                    try {
                        const result = await globalThis.navigator.locks.query();
                        console.log('@supabase/gotrue-js: Navigator LockManager state', JSON.stringify(result, null, '  '));
                    }
                    catch (e) {
                        console.warn('@supabase/gotrue-js: Error when querying Navigator LockManager state', e);
                    }
                }
                // Browser is not following the Navigator LockManager spec, it
                // returned a null lock when we didn't use ifAvailable. So we can
                // pretend the lock is acquired in the name of backward compatibility
                // and user experience and just run the function.
                console.warn('@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request');
                return await fn();
            }
        }
    }));
}

/**
 * https://mathiasbynens.be/notes/globalthis
 */
function polyfillGlobalThis() {
    if (typeof globalThis === 'object')
        return;
    try {
        Object.defineProperty(Object.prototype, '__magic__', {
            get: function () {
                return this;
            },
            configurable: true,
        });
        // @ts-expect-error 'Allow access to magic'
        __magic__.globalThis = __magic__;
        // @ts-expect-error 'Allow access to magic'
        delete Object.prototype.__magic__;
    }
    catch (e) {
        if (typeof self !== 'undefined') {
            // @ts-expect-error 'Allow access to globals'
            self.globalThis = self;
        }
    }
}

// types and functions copied over from viem so this library doesn't depend on it
function getAddress(address) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error(`@supabase/auth-js: Address "${address}" is invalid.`);
    }
    return address.toLowerCase();
}
function fromHex(hex) {
    return parseInt(hex, 16);
}
function toHex(value) {
    const bytes = new TextEncoder().encode(value);
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return ('0x' + hex);
}
/**
 * Creates EIP-4361 formatted message.
 */
function createSiweMessage(parameters) {
    var _a;
    const { chainId, domain, expirationTime, issuedAt = new Date(), nonce, notBefore, requestId, resources, scheme, uri, version, } = parameters;
    // Validate fields
    {
        if (!Number.isInteger(chainId))
            throw new Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${chainId}`);
        if (!domain)
            throw new Error(`@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.`);
        if (nonce && nonce.length < 8)
            throw new Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${nonce}`);
        if (!uri)
            throw new Error(`@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.`);
        if (version !== '1')
            throw new Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${version}`);
        if ((_a = parameters.statement) === null || _a === void 0 ? void 0 : _a.includes('\n'))
            throw new Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${parameters.statement}`);
    }
    // Construct message
    const address = getAddress(parameters.address);
    const origin = scheme ? `${scheme}://${domain}` : domain;
    const statement = parameters.statement ? `${parameters.statement}\n` : '';
    const prefix = `${origin} wants you to sign in with your Ethereum account:\n${address}\n\n${statement}`;
    let suffix = `URI: ${uri}\nVersion: ${version}\nChain ID: ${chainId}${nonce ? `\nNonce: ${nonce}` : ''}\nIssued At: ${issuedAt.toISOString()}`;
    if (expirationTime)
        suffix += `\nExpiration Time: ${expirationTime.toISOString()}`;
    if (notBefore)
        suffix += `\nNot Before: ${notBefore.toISOString()}`;
    if (requestId)
        suffix += `\nRequest ID: ${requestId}`;
    if (resources) {
        let content = '\nResources:';
        for (const resource of resources) {
            if (!resource || typeof resource !== 'string')
                throw new Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${resource}`);
            content += `\n- ${resource}`;
        }
        suffix += content;
    }
    return `${prefix}\n${suffix}`;
}

/* eslint-disable @typescript-eslint/ban-ts-comment */
/**
 * A custom Error used to return a more nuanced error detailing _why_ one of the eight documented
 * errors in the spec was raised after calling `navigator.credentials.create()` or
 * `navigator.credentials.get()`:
 *
 * - `AbortError`
 * - `ConstraintError`
 * - `InvalidStateError`
 * - `NotAllowedError`
 * - `NotSupportedError`
 * - `SecurityError`
 * - `TypeError`
 * - `UnknownError`
 *
 * Error messages were determined through investigation of the spec to determine under which
 * scenarios a given error would be raised.
 */
class WebAuthnError extends Error {
    constructor({ message, code, cause, name, }) {
        var _a;
        // @ts-ignore: help Rollup understand that `cause` is okay to set
        super(message, { cause });
        this.__isWebAuthnError = true;
        this.name = (_a = name !== null && name !== void 0 ? name : (cause instanceof Error ? cause.name : undefined)) !== null && _a !== void 0 ? _a : 'Unknown Error';
        this.code = code;
    }
}
/**
 * Error class for unknown WebAuthn errors.
 * Wraps unexpected errors that don't match known WebAuthn error conditions.
 */
class WebAuthnUnknownError extends WebAuthnError {
    constructor(message, originalError) {
        super({
            code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
            cause: originalError,
            message,
        });
        this.name = 'WebAuthnUnknownError';
        this.originalError = originalError;
    }
}
/**
 * Attempt to intuit _why_ an error was raised after calling `navigator.credentials.create()`.
 * Maps browser errors to specific WebAuthn error codes for better debugging.
 * @param {Object} params - Error identification parameters
 * @param {Error} params.error - The error thrown by the browser
 * @param {CredentialCreationOptions} params.options - The options passed to credentials.create()
 * @returns {WebAuthnError} A WebAuthnError with a specific error code
 * @see {@link https://w3c.github.io/webauthn/#sctn-createCredential W3C WebAuthn Spec - Create Credential}
 */
function identifyRegistrationError({ error, options, }) {
    var _a, _b, _c;
    const { publicKey } = options;
    if (!publicKey) {
        throw Error('options was missing required publicKey property');
    }
    if (error.name === 'AbortError') {
        if (options.signal instanceof AbortSignal) {
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 16)
            return new WebAuthnError({
                message: 'Registration ceremony was sent an abort signal',
                code: 'ERROR_CEREMONY_ABORTED',
                cause: error,
            });
        }
    }
    else if (error.name === 'ConstraintError') {
        if (((_a = publicKey.authenticatorSelection) === null || _a === void 0 ? void 0 : _a.requireResidentKey) === true) {
            // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 4)
            return new WebAuthnError({
                message: 'Discoverable credentials were required but no available authenticator supported it',
                code: 'ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT',
                cause: error,
            });
        }
        else if (
        // @ts-ignore: `mediation` doesn't yet exist on CredentialCreationOptions but it's possible as of Sept 2024
        options.mediation === 'conditional' &&
            ((_b = publicKey.authenticatorSelection) === null || _b === void 0 ? void 0 : _b.userVerification) === 'required') {
            // https://w3c.github.io/webauthn/#sctn-createCredential (Step 22.4)
            return new WebAuthnError({
                message: 'User verification was required during automatic registration but it could not be performed',
                code: 'ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE',
                cause: error,
            });
        }
        else if (((_c = publicKey.authenticatorSelection) === null || _c === void 0 ? void 0 : _c.userVerification) === 'required') {
            // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 5)
            return new WebAuthnError({
                message: 'User verification was required but no available authenticator supported it',
                code: 'ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT',
                cause: error,
            });
        }
    }
    else if (error.name === 'InvalidStateError') {
        // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 20)
        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 3)
        return new WebAuthnError({
            message: 'The authenticator was previously registered',
            code: 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED',
            cause: error,
        });
    }
    else if (error.name === 'NotAllowedError') {
        /**
         * Pass the error directly through. Platforms are overloading this error beyond what the spec
         * defines and we don't want to overwrite potentially useful error messages.
         */
        return new WebAuthnError({
            message: error.message,
            code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
            cause: error,
        });
    }
    else if (error.name === 'NotSupportedError') {
        const validPubKeyCredParams = publicKey.pubKeyCredParams.filter((param) => param.type === 'public-key');
        if (validPubKeyCredParams.length === 0) {
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 10)
            return new WebAuthnError({
                message: 'No entry in pubKeyCredParams was of type "public-key"',
                code: 'ERROR_MALFORMED_PUBKEYCREDPARAMS',
                cause: error,
            });
        }
        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 2)
        return new WebAuthnError({
            message: 'No available authenticator supported any of the specified pubKeyCredParams algorithms',
            code: 'ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG',
            cause: error,
        });
    }
    else if (error.name === 'SecurityError') {
        const effectiveDomain = window.location.hostname;
        if (!isValidDomain(effectiveDomain)) {
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 7)
            return new WebAuthnError({
                message: `${window.location.hostname} is an invalid domain`,
                code: 'ERROR_INVALID_DOMAIN',
                cause: error,
            });
        }
        else if (publicKey.rp.id !== effectiveDomain) {
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 8)
            return new WebAuthnError({
                message: `The RP ID "${publicKey.rp.id}" is invalid for this domain`,
                code: 'ERROR_INVALID_RP_ID',
                cause: error,
            });
        }
    }
    else if (error.name === 'TypeError') {
        if (publicKey.user.id.byteLength < 1 || publicKey.user.id.byteLength > 64) {
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 5)
            return new WebAuthnError({
                message: 'User ID was not between 1 and 64 characters',
                code: 'ERROR_INVALID_USER_ID_LENGTH',
                cause: error,
            });
        }
    }
    else if (error.name === 'UnknownError') {
        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 1)
        // https://www.w3.org/TR/webauthn-2/#sctn-op-make-cred (Step 8)
        return new WebAuthnError({
            message: 'The authenticator was unable to process the specified options, or could not create a new credential',
            code: 'ERROR_AUTHENTICATOR_GENERAL_ERROR',
            cause: error,
        });
    }
    return new WebAuthnError({
        message: 'a Non-Webauthn related error has occurred',
        code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
        cause: error,
    });
}
/**
 * Attempt to intuit _why_ an error was raised after calling `navigator.credentials.get()`.
 * Maps browser errors to specific WebAuthn error codes for better debugging.
 * @param {Object} params - Error identification parameters
 * @param {Error} params.error - The error thrown by the browser
 * @param {CredentialRequestOptions} params.options - The options passed to credentials.get()
 * @returns {WebAuthnError} A WebAuthnError with a specific error code
 * @see {@link https://w3c.github.io/webauthn/#sctn-getAssertion W3C WebAuthn Spec - Get Assertion}
 */
function identifyAuthenticationError({ error, options, }) {
    const { publicKey } = options;
    if (!publicKey) {
        throw Error('options was missing required publicKey property');
    }
    if (error.name === 'AbortError') {
        if (options.signal instanceof AbortSignal) {
            // https://www.w3.org/TR/webauthn-2/#sctn-createCredential (Step 16)
            return new WebAuthnError({
                message: 'Authentication ceremony was sent an abort signal',
                code: 'ERROR_CEREMONY_ABORTED',
                cause: error,
            });
        }
    }
    else if (error.name === 'NotAllowedError') {
        /**
         * Pass the error directly through. Platforms are overloading this error beyond what the spec
         * defines and we don't want to overwrite potentially useful error messages.
         */
        return new WebAuthnError({
            message: error.message,
            code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
            cause: error,
        });
    }
    else if (error.name === 'SecurityError') {
        const effectiveDomain = window.location.hostname;
        if (!isValidDomain(effectiveDomain)) {
            // https://www.w3.org/TR/webauthn-2/#sctn-discover-from-external-source (Step 5)
            return new WebAuthnError({
                message: `${window.location.hostname} is an invalid domain`,
                code: 'ERROR_INVALID_DOMAIN',
                cause: error,
            });
        }
        else if (publicKey.rpId !== effectiveDomain) {
            // https://www.w3.org/TR/webauthn-2/#sctn-discover-from-external-source (Step 6)
            return new WebAuthnError({
                message: `The RP ID "${publicKey.rpId}" is invalid for this domain`,
                code: 'ERROR_INVALID_RP_ID',
                cause: error,
            });
        }
    }
    else if (error.name === 'UnknownError') {
        // https://www.w3.org/TR/webauthn-2/#sctn-op-get-assertion (Step 1)
        // https://www.w3.org/TR/webauthn-2/#sctn-op-get-assertion (Step 12)
        return new WebAuthnError({
            message: 'The authenticator was unable to process the specified options, or could not create a new assertion signature',
            code: 'ERROR_AUTHENTICATOR_GENERAL_ERROR',
            cause: error,
        });
    }
    return new WebAuthnError({
        message: 'a Non-Webauthn related error has occurred',
        code: 'ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY',
        cause: error,
    });
}

/**
 * WebAuthn abort service to manage ceremony cancellation.
 * Ensures only one WebAuthn ceremony is active at a time to prevent "operation already in progress" errors.
 *
 * @experimental This class is experimental and may change in future releases
 * @see {@link https://w3c.github.io/webauthn/#sctn-automation-webdriver-capability W3C WebAuthn Spec - Aborting Ceremonies}
 */
class WebAuthnAbortService {
    /**
     * Create an abort signal for a new WebAuthn operation.
     * Automatically cancels any existing operation.
     *
     * @returns {AbortSignal} Signal to pass to navigator.credentials.create() or .get()
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal MDN - AbortSignal}
     */
    createNewAbortSignal() {
        // Abort any existing calls to navigator.credentials.create() or navigator.credentials.get()
        if (this.controller) {
            const abortError = new Error('Cancelling existing WebAuthn API call for new one');
            abortError.name = 'AbortError';
            this.controller.abort(abortError);
        }
        const newController = new AbortController();
        this.controller = newController;
        return newController.signal;
    }
    /**
     * Manually cancel the current WebAuthn operation.
     * Useful for cleaning up when user cancels or navigates away.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort MDN - AbortController.abort}
     */
    cancelCeremony() {
        if (this.controller) {
            const abortError = new Error('Manually cancelling existing WebAuthn API call');
            abortError.name = 'AbortError';
            this.controller.abort(abortError);
            this.controller = undefined;
        }
    }
}
/**
 * Singleton instance to ensure only one WebAuthn ceremony is active at a time.
 * This prevents "operation already in progress" errors when retrying WebAuthn operations.
 *
 * @experimental This instance is experimental and may change in future releases
 */
const webAuthnAbortService = new WebAuthnAbortService();
/**
 * Convert base64url encoded strings in WebAuthn credential creation options to ArrayBuffers
 * as required by the WebAuthn browser API.
 * Supports both native WebAuthn Level 3 parseCreationOptionsFromJSON and manual fallback.
 *
 * @param {ServerCredentialCreationOptions} options - JSON options from server with base64url encoded fields
 * @returns {PublicKeyCredentialCreationOptionsFuture} Options ready for navigator.credentials.create()
 * @see {@link https://w3c.github.io/webauthn/#sctn-parseCreationOptionsFromJSON W3C WebAuthn Spec - parseCreationOptionsFromJSON}
 */
function deserializeCredentialCreationOptions(options) {
    if (!options) {
        throw new Error('Credential creation options are required');
    }
    // Check if the native parseCreationOptionsFromJSON method is available
    if (typeof PublicKeyCredential !== 'undefined' &&
        'parseCreationOptionsFromJSON' in PublicKeyCredential &&
        typeof PublicKeyCredential
            .parseCreationOptionsFromJSON === 'function') {
        // Use the native WebAuthn Level 3 method
        return PublicKeyCredential.parseCreationOptionsFromJSON(
        /** we assert the options here as typescript still doesn't know about future webauthn types */
        options);
    }
    // Fallback to manual parsing for browsers that don't support the native method
    // Destructure to separate fields that need transformation
    const { challenge: challengeStr, user: userOpts, excludeCredentials } = options, restOptions = __rest(options
    // Convert challenge from base64url to ArrayBuffer
    , ["challenge", "user", "excludeCredentials"]);
    // Convert challenge from base64url to ArrayBuffer
    const challenge = base64UrlToUint8Array(challengeStr).buffer;
    // Convert user.id from base64url to ArrayBuffer
    const user = Object.assign(Object.assign({}, userOpts), { id: base64UrlToUint8Array(userOpts.id).buffer });
    // Build the result object
    const result = Object.assign(Object.assign({}, restOptions), { challenge,
        user });
    // Only add excludeCredentials if it exists
    if (excludeCredentials && excludeCredentials.length > 0) {
        result.excludeCredentials = new Array(excludeCredentials.length);
        for (let i = 0; i < excludeCredentials.length; i++) {
            const cred = excludeCredentials[i];
            result.excludeCredentials[i] = Object.assign(Object.assign({}, cred), { id: base64UrlToUint8Array(cred.id).buffer, type: cred.type || 'public-key', 
                // Cast transports to handle future transport types like "cable"
                transports: cred.transports });
        }
    }
    return result;
}
/**
 * Convert base64url encoded strings in WebAuthn credential request options to ArrayBuffers
 * as required by the WebAuthn browser API.
 * Supports both native WebAuthn Level 3 parseRequestOptionsFromJSON and manual fallback.
 *
 * @param {ServerCredentialRequestOptions} options - JSON options from server with base64url encoded fields
 * @returns {PublicKeyCredentialRequestOptionsFuture} Options ready for navigator.credentials.get()
 * @see {@link https://w3c.github.io/webauthn/#sctn-parseRequestOptionsFromJSON W3C WebAuthn Spec - parseRequestOptionsFromJSON}
 */
function deserializeCredentialRequestOptions(options) {
    if (!options) {
        throw new Error('Credential request options are required');
    }
    // Check if the native parseRequestOptionsFromJSON method is available
    if (typeof PublicKeyCredential !== 'undefined' &&
        'parseRequestOptionsFromJSON' in PublicKeyCredential &&
        typeof PublicKeyCredential
            .parseRequestOptionsFromJSON === 'function') {
        // Use the native WebAuthn Level 3 method
        return PublicKeyCredential.parseRequestOptionsFromJSON(options);
    }
    // Fallback to manual parsing for browsers that don't support the native method
    // Destructure to separate fields that need transformation
    const { challenge: challengeStr, allowCredentials } = options, restOptions = __rest(options
    // Convert challenge from base64url to ArrayBuffer
    , ["challenge", "allowCredentials"]);
    // Convert challenge from base64url to ArrayBuffer
    const challenge = base64UrlToUint8Array(challengeStr).buffer;
    // Build the result object
    const result = Object.assign(Object.assign({}, restOptions), { challenge });
    // Only add allowCredentials if it exists
    if (allowCredentials && allowCredentials.length > 0) {
        result.allowCredentials = new Array(allowCredentials.length);
        for (let i = 0; i < allowCredentials.length; i++) {
            const cred = allowCredentials[i];
            result.allowCredentials[i] = Object.assign(Object.assign({}, cred), { id: base64UrlToUint8Array(cred.id).buffer, type: cred.type || 'public-key', 
                // Cast transports to handle future transport types like "cable"
                transports: cred.transports });
        }
    }
    return result;
}
/**
 * Convert a registration/enrollment credential response to server format.
 * Serializes binary fields to base64url for JSON transmission.
 * Supports both native WebAuthn Level 3 toJSON and manual fallback.
 *
 * @param {RegistrationCredential} credential - Credential from navigator.credentials.create()
 * @returns {RegistrationResponseJSON} JSON-serializable credential for server
 * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredential-tojson W3C WebAuthn Spec - toJSON}
 */
function serializeCredentialCreationResponse(credential) {
    var _a;
    // Check if the credential instance has the toJSON method
    if ('toJSON' in credential && typeof credential.toJSON === 'function') {
        // Use the native WebAuthn Level 3 method
        return credential.toJSON();
    }
    const credentialWithAttachment = credential;
    return {
        id: credential.id,
        rawId: credential.id,
        response: {
            attestationObject: bytesToBase64URL(new Uint8Array(credential.response.attestationObject)),
            clientDataJSON: bytesToBase64URL(new Uint8Array(credential.response.clientDataJSON)),
        },
        type: 'public-key',
        clientExtensionResults: credential.getClientExtensionResults(),
        // Convert null to undefined and cast to AuthenticatorAttachment type
        authenticatorAttachment: ((_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0 ? _a : undefined),
    };
}
/**
 * Convert an authentication/verification credential response to server format.
 * Serializes binary fields to base64url for JSON transmission.
 * Supports both native WebAuthn Level 3 toJSON and manual fallback.
 *
 * @param {AuthenticationCredential} credential - Credential from navigator.credentials.get()
 * @returns {AuthenticationResponseJSON} JSON-serializable credential for server
 * @see {@link https://w3c.github.io/webauthn/#dom-publickeycredential-tojson W3C WebAuthn Spec - toJSON}
 */
function serializeCredentialRequestResponse(credential) {
    var _a;
    // Check if the credential instance has the toJSON method
    if ('toJSON' in credential && typeof credential.toJSON === 'function') {
        // Use the native WebAuthn Level 3 method
        return credential.toJSON();
    }
    // Fallback to manual conversion for browsers that don't support toJSON
    // Access authenticatorAttachment via type assertion to handle TypeScript version differences
    // @simplewebauthn/types includes this property but base TypeScript 4.7.4 doesn't
    const credentialWithAttachment = credential;
    const clientExtensionResults = credential.getClientExtensionResults();
    const assertionResponse = credential.response;
    return {
        id: credential.id,
        rawId: credential.id, // W3C spec expects rawId to match id for JSON format
        response: {
            authenticatorData: bytesToBase64URL(new Uint8Array(assertionResponse.authenticatorData)),
            clientDataJSON: bytesToBase64URL(new Uint8Array(assertionResponse.clientDataJSON)),
            signature: bytesToBase64URL(new Uint8Array(assertionResponse.signature)),
            userHandle: assertionResponse.userHandle
                ? bytesToBase64URL(new Uint8Array(assertionResponse.userHandle))
                : undefined,
        },
        type: 'public-key',
        clientExtensionResults,
        // Convert null to undefined and cast to AuthenticatorAttachment type
        authenticatorAttachment: ((_a = credentialWithAttachment.authenticatorAttachment) !== null && _a !== void 0 ? _a : undefined),
    };
}
/**
 * A simple test to determine if a hostname is a properly-formatted domain name.
 * Considers localhost valid for development environments.
 *
 * A "valid domain" is defined here: https://url.spec.whatwg.org/#valid-domain
 *
 * Regex sourced from here:
 * https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch08s15.html
 *
 * @param {string} hostname - The hostname to validate
 * @returns {boolean} True if valid domain or localhost
 * @see {@link https://url.spec.whatwg.org/#valid-domain WHATWG URL Spec - Valid Domain}
 */
function isValidDomain(hostname) {
    return (
    // Consider localhost valid as well since it's okay wrt Secure Contexts
    hostname === 'localhost' || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(hostname));
}
/**
 * Determine if the browser is capable of WebAuthn.
 * Checks for necessary Web APIs: PublicKeyCredential and Credential Management.
 *
 * @returns {boolean} True if browser supports WebAuthn
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential#browser_compatibility MDN - PublicKeyCredential Browser Compatibility}
 */
function browserSupportsWebAuthn() {
    var _a, _b;
    return !!(isBrowser() &&
        'PublicKeyCredential' in window &&
        window.PublicKeyCredential &&
        'credentials' in navigator &&
        typeof ((_a = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _a === void 0 ? void 0 : _a.create) === 'function' &&
        typeof ((_b = navigator === null || navigator === void 0 ? void 0 : navigator.credentials) === null || _b === void 0 ? void 0 : _b.get) === 'function');
}
/**
 * Create a WebAuthn credential using the browser's credentials API.
 * Wraps navigator.credentials.create() with error handling.
 *
 * @param {CredentialCreationOptions} options - Options including publicKey parameters
 * @returns {Promise<RequestResult<RegistrationCredential, WebAuthnError>>} Created credential or error
 * @see {@link https://w3c.github.io/webauthn/#sctn-createCredential W3C WebAuthn Spec - Create Credential}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/create MDN - credentials.create}
 */
async function createCredential(options) {
    try {
        const response = await navigator.credentials.create(
        /** we assert the type here until typescript types are updated */
        options);
        if (!response) {
            return {
                data: null,
                error: new WebAuthnUnknownError('Empty credential response', response),
            };
        }
        if (!(response instanceof PublicKeyCredential)) {
            return {
                data: null,
                error: new WebAuthnUnknownError('Browser returned unexpected credential type', response),
            };
        }
        return { data: response, error: null };
    }
    catch (err) {
        return {
            data: null,
            error: identifyRegistrationError({
                error: err,
                options,
            }),
        };
    }
}
/**
 * Get a WebAuthn credential using the browser's credentials API.
 * Wraps navigator.credentials.get() with error handling.
 *
 * @param {CredentialRequestOptions} options - Options including publicKey parameters
 * @returns {Promise<RequestResult<AuthenticationCredential, WebAuthnError>>} Retrieved credential or error
 * @see {@link https://w3c.github.io/webauthn/#sctn-getAssertion W3C WebAuthn Spec - Get Assertion}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/get MDN - credentials.get}
 */
async function getCredential(options) {
    try {
        const response = await navigator.credentials.get(
        /** we assert the type here until typescript types are updated */
        options);
        if (!response) {
            return {
                data: null,
                error: new WebAuthnUnknownError('Empty credential response', response),
            };
        }
        if (!(response instanceof PublicKeyCredential)) {
            return {
                data: null,
                error: new WebAuthnUnknownError('Browser returned unexpected credential type', response),
            };
        }
        return { data: response, error: null };
    }
    catch (err) {
        return {
            data: null,
            error: identifyAuthenticationError({
                error: err,
                options,
            }),
        };
    }
}
const DEFAULT_CREATION_OPTIONS = {
    hints: ['security-key'],
    authenticatorSelection: {
        authenticatorAttachment: 'cross-platform',
        requireResidentKey: false,
        /** set to preferred because older yubikeys don't have PIN/Biometric */
        userVerification: 'preferred',
        residentKey: 'discouraged',
    },
    attestation: 'direct',
};
const DEFAULT_REQUEST_OPTIONS = {
    /** set to preferred because older yubikeys don't have PIN/Biometric */
    userVerification: 'preferred',
    hints: ['security-key'],
    attestation: 'direct',
};
function deepMerge(...sources) {
    const isObject = (val) => val !== null && typeof val === 'object' && !Array.isArray(val);
    const isArrayBufferLike = (val) => val instanceof ArrayBuffer || ArrayBuffer.isView(val);
    const result = {};
    for (const source of sources) {
        if (!source)
            continue;
        for (const key in source) {
            const value = source[key];
            if (value === undefined)
                continue;
            if (Array.isArray(value)) {
                // preserve array reference, including unions like AuthenticatorTransport[]
                result[key] = value;
            }
            else if (isArrayBufferLike(value)) {
                result[key] = value;
            }
            else if (isObject(value)) {
                const existing = result[key];
                if (isObject(existing)) {
                    result[key] = deepMerge(existing, value);
                }
                else {
                    result[key] = deepMerge(value);
                }
            }
            else {
                result[key] = value;
            }
        }
    }
    return result;
}
/**
 * Merges WebAuthn credential creation options with overrides.
 * Sets sensible defaults for authenticator selection and extensions.
 *
 * @param {PublicKeyCredentialCreationOptionsFuture} baseOptions - The base options from the server
 * @param {PublicKeyCredentialCreationOptionsFuture} overrides - Optional overrides to apply
 * @param {string} friendlyName - Optional friendly name for the credential
 * @returns {PublicKeyCredentialCreationOptionsFuture} Merged credential creation options
 * @see {@link https://w3c.github.io/webauthn/#dictdef-authenticatorselectioncriteria W3C WebAuthn Spec - AuthenticatorSelectionCriteria}
 */
function mergeCredentialCreationOptions(baseOptions, overrides) {
    return deepMerge(DEFAULT_CREATION_OPTIONS, baseOptions, overrides || {});
}
/**
 * Merges WebAuthn credential request options with overrides.
 * Sets sensible defaults for user verification and hints.
 *
 * @param {PublicKeyCredentialRequestOptionsFuture} baseOptions - The base options from the server
 * @param {PublicKeyCredentialRequestOptionsFuture} overrides - Optional overrides to apply
 * @returns {PublicKeyCredentialRequestOptionsFuture} Merged credential request options
 * @see {@link https://w3c.github.io/webauthn/#dictdef-publickeycredentialrequestoptions W3C WebAuthn Spec - PublicKeyCredentialRequestOptions}
 */
function mergeCredentialRequestOptions(baseOptions, overrides) {
    return deepMerge(DEFAULT_REQUEST_OPTIONS, baseOptions, overrides || {});
}
/**
 * WebAuthn API wrapper for Supabase Auth.
 * Provides methods for enrolling, challenging, verifying, authenticating, and registering WebAuthn credentials.
 *
 * @experimental This API is experimental and may change in future releases
 * @see {@link https://w3c.github.io/webauthn/ W3C WebAuthn Specification}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API MDN - Web Authentication API}
 */
class WebAuthnApi {
    constructor(client) {
        this.client = client;
        // Bind all methods so they can be destructured
        this.enroll = this._enroll.bind(this);
        this.challenge = this._challenge.bind(this);
        this.verify = this._verify.bind(this);
        this.authenticate = this._authenticate.bind(this);
        this.register = this._register.bind(this);
    }
    /**
     * Enroll a new WebAuthn factor.
     * Creates an unverified WebAuthn factor that must be verified with a credential.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {Omit<MFAEnrollWebauthnParams, 'factorType'>} params - Enrollment parameters (friendlyName required)
     * @returns {Promise<AuthMFAEnrollWebauthnResponse>} Enrolled factor details or error
     * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registering a New Credential}
     */
    async _enroll(params) {
        return this.client.mfa.enroll(Object.assign(Object.assign({}, params), { factorType: 'webauthn' }));
    }
    /**
     * Challenge for WebAuthn credential creation or authentication.
     * Combines server challenge with browser credential operations.
     * Handles both registration (create) and authentication (request) flows.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {MFAChallengeWebauthnParams & { friendlyName?: string; signal?: AbortSignal }} params - Challenge parameters including factorId
     * @param {Object} overrides - Allows you to override the parameters passed to navigator.credentials
     * @param {PublicKeyCredentialCreationOptionsFuture} overrides.create - Override options for credential creation
     * @param {PublicKeyCredentialRequestOptionsFuture} overrides.request - Override options for credential request
     * @returns {Promise<RequestResult>} Challenge response with credential or error
     * @see {@link https://w3c.github.io/webauthn/#sctn-credential-creation W3C WebAuthn Spec - Credential Creation}
     * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying Assertion}
     */
    async _challenge({ factorId, webauthn, friendlyName, signal, }, overrides) {
        try {
            // Get challenge from server using the client's MFA methods
            const { data: challengeResponse, error: challengeError } = await this.client.mfa.challenge({
                factorId,
                webauthn,
            });
            if (!challengeResponse) {
                return { data: null, error: challengeError };
            }
            const abortSignal = signal !== null && signal !== void 0 ? signal : webAuthnAbortService.createNewAbortSignal();
            /** webauthn will fail if either of the name/displayname are blank */
            if (challengeResponse.webauthn.type === 'create') {
                const { user } = challengeResponse.webauthn.credential_options.publicKey;
                if (!user.name) {
                    user.name = `${user.id}:${friendlyName}`;
                }
                if (!user.displayName) {
                    user.displayName = user.name;
                }
            }
            switch (challengeResponse.webauthn.type) {
                case 'create': {
                    const options = mergeCredentialCreationOptions(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.create);
                    const { data, error } = await createCredential({
                        publicKey: options,
                        signal: abortSignal,
                    });
                    if (data) {
                        return {
                            data: {
                                factorId,
                                challengeId: challengeResponse.id,
                                webauthn: {
                                    type: challengeResponse.webauthn.type,
                                    credential_response: data,
                                },
                            },
                            error: null,
                        };
                    }
                    return { data: null, error };
                }
                case 'request': {
                    const options = mergeCredentialRequestOptions(challengeResponse.webauthn.credential_options.publicKey, overrides === null || overrides === void 0 ? void 0 : overrides.request);
                    const { data, error } = await getCredential(Object.assign(Object.assign({}, challengeResponse.webauthn.credential_options), { publicKey: options, signal: abortSignal }));
                    if (data) {
                        return {
                            data: {
                                factorId,
                                challengeId: challengeResponse.id,
                                webauthn: {
                                    type: challengeResponse.webauthn.type,
                                    credential_response: data,
                                },
                            },
                            error: null,
                        };
                    }
                    return { data: null, error };
                }
            }
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            return {
                data: null,
                error: new AuthUnknownError('Unexpected error in challenge', error),
            };
        }
    }
    /**
     * Verify a WebAuthn credential with the server.
     * Completes the WebAuthn ceremony by sending the credential to the server for verification.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {Object} params - Verification parameters
     * @param {string} params.challengeId - ID of the challenge being verified
     * @param {string} params.factorId - ID of the WebAuthn factor
     * @param {MFAVerifyWebauthnParams<T>['webauthn']} params.webauthn - WebAuthn credential response
     * @returns {Promise<AuthMFAVerifyResponse>} Verification result with session or error
     * @see {@link https://w3c.github.io/webauthn/#sctn-verifying-assertion W3C WebAuthn Spec - Verifying an Authentication Assertion}
     * */
    async _verify({ challengeId, factorId, webauthn, }) {
        return this.client.mfa.verify({
            factorId,
            challengeId,
            webauthn: webauthn,
        });
    }
    /**
     * Complete WebAuthn authentication flow.
     * Performs challenge and verification in a single operation for existing credentials.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {Object} params - Authentication parameters
     * @param {string} params.factorId - ID of the WebAuthn factor to authenticate with
     * @param {Object} params.webauthn - WebAuthn configuration
     * @param {string} params.webauthn.rpId - Relying Party ID (defaults to current hostname)
     * @param {string[]} params.webauthn.rpOrigins - Allowed origins (defaults to current origin)
     * @param {AbortSignal} params.webauthn.signal - Optional abort signal
     * @param {PublicKeyCredentialRequestOptionsFuture} overrides - Override options for navigator.credentials.get
     * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Authentication result
     * @see {@link https://w3c.github.io/webauthn/#sctn-authentication W3C WebAuthn Spec - Authentication Ceremony}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialRequestOptions MDN - PublicKeyCredentialRequestOptions}
     */
    async _authenticate({ factorId, webauthn: { rpId = typeof window !== 'undefined' ? window.location.hostname : undefined, rpOrigins = typeof window !== 'undefined' ? [window.location.origin] : undefined, signal, } = {}, }, overrides) {
        if (!rpId) {
            return {
                data: null,
                error: new AuthError('rpId is required for WebAuthn authentication'),
            };
        }
        try {
            if (!browserSupportsWebAuthn()) {
                return {
                    data: null,
                    error: new AuthUnknownError('Browser does not support WebAuthn', null),
                };
            }
            // Get challenge and credential
            const { data: challengeResponse, error: challengeError } = await this.challenge({
                factorId,
                webauthn: { rpId, rpOrigins },
                signal,
            }, { request: overrides });
            if (!challengeResponse) {
                return { data: null, error: challengeError };
            }
            const { webauthn } = challengeResponse;
            // Verify credential
            return this._verify({
                factorId,
                challengeId: challengeResponse.challengeId,
                webauthn: {
                    type: webauthn.type,
                    rpId,
                    rpOrigins,
                    credential_response: webauthn.credential_response,
                },
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            return {
                data: null,
                error: new AuthUnknownError('Unexpected error in authenticate', error),
            };
        }
    }
    /**
     * Complete WebAuthn registration flow.
     * Performs enrollment, challenge, and verification in a single operation for new credentials.
     *
     * @experimental This method is experimental and may change in future releases
     * @param {Object} params - Registration parameters
     * @param {string} params.friendlyName - User-friendly name for the credential
     * @param {string} params.rpId - Relying Party ID (defaults to current hostname)
     * @param {string[]} params.rpOrigins - Allowed origins (defaults to current origin)
     * @param {AbortSignal} params.signal - Optional abort signal
     * @param {PublicKeyCredentialCreationOptionsFuture} overrides - Override options for navigator.credentials.create
     * @returns {Promise<RequestResult<AuthMFAVerifyResponseData, WebAuthnError | AuthError>>} Registration result
     * @see {@link https://w3c.github.io/webauthn/#sctn-registering-a-new-credential W3C WebAuthn Spec - Registration Ceremony}
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions MDN - PublicKeyCredentialCreationOptions}
     */
    async _register({ friendlyName, webauthn: { rpId = typeof window !== 'undefined' ? window.location.hostname : undefined, rpOrigins = typeof window !== 'undefined' ? [window.location.origin] : undefined, signal, } = {}, }, overrides) {
        if (!rpId) {
            return {
                data: null,
                error: new AuthError('rpId is required for WebAuthn registration'),
            };
        }
        try {
            if (!browserSupportsWebAuthn()) {
                return {
                    data: null,
                    error: new AuthUnknownError('Browser does not support WebAuthn', null),
                };
            }
            // Enroll factor
            const { data: factor, error: enrollError } = await this._enroll({
                friendlyName,
            });
            if (!factor) {
                await this.client.mfa
                    .listFactors()
                    .then((factors) => {
                    var _a;
                    return (_a = factors.data) === null || _a === void 0 ? void 0 : _a.all.find((v) => v.factor_type === 'webauthn' &&
                        v.friendly_name === friendlyName &&
                        v.status !== 'unverified');
                })
                    .then((factor) => (factor ? this.client.mfa.unenroll({ factorId: factor === null || factor === void 0 ? void 0 : factor.id }) : void 0));
                return { data: null, error: enrollError };
            }
            // Get challenge and create credential
            const { data: challengeResponse, error: challengeError } = await this._challenge({
                factorId: factor.id,
                friendlyName: factor.friendly_name,
                webauthn: { rpId, rpOrigins },
                signal,
            }, {
                create: overrides,
            });
            if (!challengeResponse) {
                return { data: null, error: challengeError };
            }
            return this._verify({
                factorId: factor.id,
                challengeId: challengeResponse.challengeId,
                webauthn: {
                    rpId,
                    rpOrigins,
                    type: challengeResponse.webauthn.type,
                    credential_response: challengeResponse.webauthn.credential_response,
                },
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return { data: null, error };
            }
            return {
                data: null,
                error: new AuthUnknownError('Unexpected error in register', error),
            };
        }
    }
}

polyfillGlobalThis(); // Make "globalThis" available
const DEFAULT_OPTIONS = {
    url: GOTRUE_URL,
    storageKey: STORAGE_KEY,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    headers: DEFAULT_HEADERS$1,
    flowType: 'implicit',
    debug: false,
    hasCustomAuthorizationHeader: false,
    throwOnError: false,
    lockAcquireTimeout: 10000, // 10 seconds
};
async function lockNoOp(name, acquireTimeout, fn) {
    return await fn();
}
/**
 * Caches JWKS values for all clients created in the same environment. This is
 * especially useful for shared-memory execution environments such as Vercel's
 * Fluid Compute, AWS Lambda or Supabase's Edge Functions. Regardless of how
 * many clients are created, if they share the same storage key they will use
 * the same JWKS cache, significantly speeding up getClaims() with asymmetric
 * JWTs.
 */
const GLOBAL_JWKS = {};
class GoTrueClient {
    /**
     * The JWKS used for verifying asymmetric JWTs
     */
    get jwks() {
        var _a, _b;
        return (_b = (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.jwks) !== null && _b !== void 0 ? _b : { keys: [] };
    }
    set jwks(value) {
        GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), { jwks: value });
    }
    get jwks_cached_at() {
        var _a, _b;
        return (_b = (_a = GLOBAL_JWKS[this.storageKey]) === null || _a === void 0 ? void 0 : _a.cachedAt) !== null && _b !== void 0 ? _b : Number.MIN_SAFE_INTEGER;
    }
    set jwks_cached_at(value) {
        GLOBAL_JWKS[this.storageKey] = Object.assign(Object.assign({}, GLOBAL_JWKS[this.storageKey]), { cachedAt: value });
    }
    /**
     * Create a new client for use in the browser.
     *
     * @example
     * ```ts
     * import { GoTrueClient } from '@supabase/auth-js'
     *
     * const auth = new GoTrueClient({
     *   url: 'https://xyzcompany.supabase.co/auth/v1',
     *   headers: { apikey: 'public-anon-key' },
     *   storageKey: 'supabase-auth',
     * })
     * ```
     */
    constructor(options) {
        var _a, _b, _c;
        /**
         * @experimental
         */
        this.userStorage = null;
        this.memoryStorage = null;
        this.stateChangeEmitters = new Map();
        this.autoRefreshTicker = null;
        this.autoRefreshTickTimeout = null;
        this.visibilityChangedCallback = null;
        this.refreshingDeferred = null;
        /**
         * Keeps track of the async client initialization.
         * When null or not yet resolved the auth state is `unknown`
         * Once resolved the auth state is known and it's safe to call any further client methods.
         * Keep extra care to never reject or throw uncaught errors
         */
        this.initializePromise = null;
        this.detectSessionInUrl = true;
        this.hasCustomAuthorizationHeader = false;
        this.suppressGetSessionWarning = false;
        this.lockAcquired = false;
        this.pendingInLock = [];
        /**
         * Used to broadcast state change events to other tabs listening.
         */
        this.broadcastChannel = null;
        this.logger = console.log;
        const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
        this.storageKey = settings.storageKey;
        this.instanceID = (_a = GoTrueClient.nextInstanceID[this.storageKey]) !== null && _a !== void 0 ? _a : 0;
        GoTrueClient.nextInstanceID[this.storageKey] = this.instanceID + 1;
        this.logDebugMessages = !!settings.debug;
        if (typeof settings.debug === 'function') {
            this.logger = settings.debug;
        }
        if (this.instanceID > 0 && isBrowser()) {
            const message = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;
            console.warn(message);
            if (this.logDebugMessages) {
                console.trace(message);
            }
        }
        this.persistSession = settings.persistSession;
        this.autoRefreshToken = settings.autoRefreshToken;
        this.admin = new GoTrueAdminApi({
            url: settings.url,
            headers: settings.headers,
            fetch: settings.fetch,
        });
        this.url = settings.url;
        this.headers = settings.headers;
        this.fetch = resolveFetch$1(settings.fetch);
        this.lock = settings.lock || lockNoOp;
        this.detectSessionInUrl = settings.detectSessionInUrl;
        this.flowType = settings.flowType;
        this.hasCustomAuthorizationHeader = settings.hasCustomAuthorizationHeader;
        this.throwOnError = settings.throwOnError;
        this.lockAcquireTimeout = settings.lockAcquireTimeout;
        if (settings.lock) {
            this.lock = settings.lock;
        }
        else if (this.persistSession && isBrowser() && ((_b = globalThis === null || globalThis === void 0 ? void 0 : globalThis.navigator) === null || _b === void 0 ? void 0 : _b.locks)) {
            this.lock = navigatorLock;
        }
        else {
            this.lock = lockNoOp;
        }
        if (!this.jwks) {
            this.jwks = { keys: [] };
            this.jwks_cached_at = Number.MIN_SAFE_INTEGER;
        }
        this.mfa = {
            verify: this._verify.bind(this),
            enroll: this._enroll.bind(this),
            unenroll: this._unenroll.bind(this),
            challenge: this._challenge.bind(this),
            listFactors: this._listFactors.bind(this),
            challengeAndVerify: this._challengeAndVerify.bind(this),
            getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this),
            webauthn: new WebAuthnApi(this),
        };
        this.oauth = {
            getAuthorizationDetails: this._getAuthorizationDetails.bind(this),
            approveAuthorization: this._approveAuthorization.bind(this),
            denyAuthorization: this._denyAuthorization.bind(this),
            listGrants: this._listOAuthGrants.bind(this),
            revokeGrant: this._revokeOAuthGrant.bind(this),
        };
        if (this.persistSession) {
            if (settings.storage) {
                this.storage = settings.storage;
            }
            else {
                if (supportsLocalStorage()) {
                    this.storage = globalThis.localStorage;
                }
                else {
                    this.memoryStorage = {};
                    this.storage = memoryLocalStorageAdapter(this.memoryStorage);
                }
            }
            if (settings.userStorage) {
                this.userStorage = settings.userStorage;
            }
        }
        else {
            this.memoryStorage = {};
            this.storage = memoryLocalStorageAdapter(this.memoryStorage);
        }
        if (isBrowser() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
            try {
                this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
            }
            catch (e) {
                console.error('Failed to create a new BroadcastChannel, multi-tab state changes will not be available', e);
            }
            (_c = this.broadcastChannel) === null || _c === void 0 ? void 0 : _c.addEventListener('message', async (event) => {
                this._debug('received broadcast notification from other tab or client', event);
                await this._notifyAllSubscribers(event.data.event, event.data.session, false); // broadcast = false so we don't get an endless loop of messages
            });
        }
        this.initialize();
    }
    /**
     * Returns whether error throwing mode is enabled for this client.
     */
    isThrowOnErrorEnabled() {
        return this.throwOnError;
    }
    /**
     * Centralizes return handling with optional error throwing. When `throwOnError` is enabled
     * and the provided result contains a non-nullish error, the error is thrown instead of
     * being returned. This ensures consistent behavior across all public API methods.
     */
    _returnResult(result) {
        if (this.throwOnError && result && result.error) {
            throw result.error;
        }
        return result;
    }
    _logPrefix() {
        return ('GoTrueClient@' +
            `${this.storageKey}:${this.instanceID} (${version$1}) ${new Date().toISOString()}`);
    }
    _debug(...args) {
        if (this.logDebugMessages) {
            this.logger(this._logPrefix(), ...args);
        }
        return this;
    }
    /**
     * Initializes the client session either from the url or from storage.
     * This method is automatically called when instantiating the client, but should also be called
     * manually when checking for an error from an auth redirect (oauth, magiclink, password recovery, etc).
     */
    async initialize() {
        if (this.initializePromise) {
            return await this.initializePromise;
        }
        this.initializePromise = (async () => {
            return await this._acquireLock(this.lockAcquireTimeout, async () => {
                return await this._initialize();
            });
        })();
        return await this.initializePromise;
    }
    /**
     * IMPORTANT:
     * 1. Never throw in this method, as it is called from the constructor
     * 2. Never return a session from this method as it would be cached over
     *    the whole lifetime of the client
     */
    async _initialize() {
        var _a;
        try {
            let params = {};
            let callbackUrlType = 'none';
            if (isBrowser()) {
                params = parseParametersFromURL(window.location.href);
                if (this._isImplicitGrantCallback(params)) {
                    callbackUrlType = 'implicit';
                }
                else if (await this._isPKCECallback(params)) {
                    callbackUrlType = 'pkce';
                }
            }
            /**
             * Attempt to get the session from the URL only if these conditions are fulfilled
             *
             * Note: If the URL isn't one of the callback url types (implicit or pkce),
             * then there could be an existing session so we don't want to prematurely remove it
             */
            if (isBrowser() && this.detectSessionInUrl && callbackUrlType !== 'none') {
                const { data, error } = await this._getSessionFromURL(params, callbackUrlType);
                if (error) {
                    this._debug('#_initialize()', 'error detecting session from URL', error);
                    if (isAuthImplicitGrantRedirectError(error)) {
                        const errorCode = (_a = error.details) === null || _a === void 0 ? void 0 : _a.code;
                        if (errorCode === 'identity_already_exists' ||
                            errorCode === 'identity_not_found' ||
                            errorCode === 'single_identity_not_deletable') {
                            return { error };
                        }
                    }
                    // Don't remove existing session on URL login failure.
                    // A failed attempt (e.g. reused magic link) shouldn't invalidate a valid session.
                    return { error };
                }
                const { session, redirectType } = data;
                this._debug('#_initialize()', 'detected session in URL', session, 'redirect type', redirectType);
                await this._saveSession(session);
                setTimeout(async () => {
                    if (redirectType === 'recovery') {
                        await this._notifyAllSubscribers('PASSWORD_RECOVERY', session);
                    }
                    else {
                        await this._notifyAllSubscribers('SIGNED_IN', session);
                    }
                }, 0);
                return { error: null };
            }
            // no login attempt via callback url try to recover session from storage
            await this._recoverAndRefresh();
            return { error: null };
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ error });
            }
            return this._returnResult({
                error: new AuthUnknownError('Unexpected error during initialization', error),
            });
        }
        finally {
            await this._handleVisibilityChange();
            this._debug('#_initialize()', 'end');
        }
    }
    /**
     * Creates a new anonymous user.
     *
     * @returns A session where the is_anonymous claim in the access token JWT set to true
     */
    async signInAnonymously(credentials) {
        var _a, _b, _c;
        try {
            const res = await _request(this.fetch, 'POST', `${this.url}/signup`, {
                headers: this.headers,
                body: {
                    data: (_b = (_a = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : {},
                    gotrue_meta_security: { captcha_token: (_c = credentials === null || credentials === void 0 ? void 0 : credentials.options) === null || _c === void 0 ? void 0 : _c.captchaToken },
                },
                xform: _sessionResponse,
            });
            const { data, error } = res;
            if (error || !data) {
                return this._returnResult({ data: { user: null, session: null }, error: error });
            }
            const session = data.session;
            const user = data.user;
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', session);
            }
            return this._returnResult({ data: { user, session }, error: null });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
        }
    }
    /**
     * Creates a new user.
     *
     * Be aware that if a user account exists in the system you may get back an
     * error message that attempts to hide this information from the user.
     * This method has support for PKCE via email signups. The PKCE flow cannot be used when autoconfirm is enabled.
     *
     * @returns A logged-in session if the server has "autoconfirm" ON
     * @returns A user if the server has "autoconfirm" OFF
     */
    async signUp(credentials) {
        var _a, _b, _c;
        try {
            let res;
            if ('email' in credentials) {
                const { email, password, options } = credentials;
                let codeChallenge = null;
                let codeChallengeMethod = null;
                if (this.flowType === 'pkce') {
                    ;
                    [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                }
                res = await _request(this.fetch, 'POST', `${this.url}/signup`, {
                    headers: this.headers,
                    redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                    body: {
                        email,
                        password,
                        data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                        code_challenge: codeChallenge,
                        code_challenge_method: codeChallengeMethod,
                    },
                    xform: _sessionResponse,
                });
            }
            else if ('phone' in credentials) {
                const { phone, password, options } = credentials;
                res = await _request(this.fetch, 'POST', `${this.url}/signup`, {
                    headers: this.headers,
                    body: {
                        phone,
                        password,
                        data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
                        channel: (_c = options === null || options === void 0 ? void 0 : options.channel) !== null && _c !== void 0 ? _c : 'sms',
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                    },
                    xform: _sessionResponse,
                });
            }
            else {
                throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a password');
            }
            const { data, error } = res;
            if (error || !data) {
                await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
                return this._returnResult({ data: { user: null, session: null }, error: error });
            }
            const session = data.session;
            const user = data.user;
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', session);
            }
            return this._returnResult({ data: { user, session }, error: null });
        }
        catch (error) {
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            if (isAuthError(error)) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
        }
    }
    /**
     * Log in an existing user with an email and password or phone and password.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or that the
     * email/phone and password combination is wrong or that the account can only
     * be accessed via social login.
     */
    async signInWithPassword(credentials) {
        try {
            let res;
            if ('email' in credentials) {
                const { email, password, options } = credentials;
                res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                    headers: this.headers,
                    body: {
                        email,
                        password,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                    },
                    xform: _sessionResponsePassword,
                });
            }
            else if ('phone' in credentials) {
                const { phone, password, options } = credentials;
                res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=password`, {
                    headers: this.headers,
                    body: {
                        phone,
                        password,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                    },
                    xform: _sessionResponsePassword,
                });
            }
            else {
                throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a password');
            }
            const { data, error } = res;
            if (error) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            else if (!data || !data.session || !data.user) {
                const invalidTokenError = new AuthInvalidTokenResponseError();
                return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return this._returnResult({
                data: Object.assign({ user: data.user, session: data.session }, (data.weak_password ? { weakPassword: data.weak_password } : null)),
                error,
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
        }
    }
    /**
     * Log in an existing user via a third-party provider.
     * This method supports the PKCE flow.
     */
    async signInWithOAuth(credentials) {
        var _a, _b, _c, _d;
        return await this._handleProviderSignIn(credentials.provider, {
            redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
            scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
            queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
            skipBrowserRedirect: (_d = credentials.options) === null || _d === void 0 ? void 0 : _d.skipBrowserRedirect,
        });
    }
    /**
     * Log in an existing user by exchanging an Auth Code issued during the PKCE flow.
     */
    async exchangeCodeForSession(authCode) {
        await this.initializePromise;
        return this._acquireLock(this.lockAcquireTimeout, async () => {
            return this._exchangeCodeForSession(authCode);
        });
    }
    /**
     * Signs in a user by verifying a message signed by the user's private key.
     * Supports Ethereum (via Sign-In-With-Ethereum) & Solana (Sign-In-With-Solana) standards,
     * both of which derive from the EIP-4361 standard
     * With slight variation on Solana's side.
     * @reference https://eips.ethereum.org/EIPS/eip-4361
     */
    async signInWithWeb3(credentials) {
        const { chain } = credentials;
        switch (chain) {
            case 'ethereum':
                return await this.signInWithEthereum(credentials);
            case 'solana':
                return await this.signInWithSolana(credentials);
            default:
                throw new Error(`@supabase/auth-js: Unsupported chain "${chain}"`);
        }
    }
    async signInWithEthereum(credentials) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        // TODO: flatten type
        let message;
        let signature;
        if ('message' in credentials) {
            message = credentials.message;
            signature = credentials.signature;
        }
        else {
            const { chain, wallet, statement, options } = credentials;
            let resolvedWallet;
            if (!isBrowser()) {
                if (typeof wallet !== 'object' || !(options === null || options === void 0 ? void 0 : options.url)) {
                    throw new Error('@supabase/auth-js: Both wallet and url must be specified in non-browser environments.');
                }
                resolvedWallet = wallet;
            }
            else if (typeof wallet === 'object') {
                resolvedWallet = wallet;
            }
            else {
                const windowAny = window;
                if ('ethereum' in windowAny &&
                    typeof windowAny.ethereum === 'object' &&
                    'request' in windowAny.ethereum &&
                    typeof windowAny.ethereum.request === 'function') {
                    resolvedWallet = windowAny.ethereum;
                }
                else {
                    throw new Error(`@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.`);
                }
            }
            const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
            const accounts = await resolvedWallet
                .request({
                method: 'eth_requestAccounts',
            })
                .then((accs) => accs)
                .catch(() => {
                throw new Error(`@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid`);
            });
            if (!accounts || accounts.length === 0) {
                throw new Error(`@supabase/auth-js: No accounts available. Please ensure the wallet is connected.`);
            }
            const address = getAddress(accounts[0]);
            let chainId = (_b = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _b === void 0 ? void 0 : _b.chainId;
            if (!chainId) {
                const chainIdHex = await resolvedWallet.request({
                    method: 'eth_chainId',
                });
                chainId = fromHex(chainIdHex);
            }
            const siweMessage = {
                domain: url.host,
                address: address,
                statement: statement,
                uri: url.href,
                version: '1',
                chainId: chainId,
                nonce: (_c = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _c === void 0 ? void 0 : _c.nonce,
                issuedAt: (_e = (_d = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _d === void 0 ? void 0 : _d.issuedAt) !== null && _e !== void 0 ? _e : new Date(),
                expirationTime: (_f = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _f === void 0 ? void 0 : _f.expirationTime,
                notBefore: (_g = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _g === void 0 ? void 0 : _g.notBefore,
                requestId: (_h = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _h === void 0 ? void 0 : _h.requestId,
                resources: (_j = options === null || options === void 0 ? void 0 : options.signInWithEthereum) === null || _j === void 0 ? void 0 : _j.resources,
            };
            message = createSiweMessage(siweMessage);
            // Sign message
            signature = (await resolvedWallet.request({
                method: 'personal_sign',
                params: [toHex(message), address],
            }));
        }
        try {
            const { data, error } = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=web3`, {
                headers: this.headers,
                body: Object.assign({ chain: 'ethereum', message,
                    signature }, (((_k = credentials.options) === null || _k === void 0 ? void 0 : _k.captchaToken)
                    ? { gotrue_meta_security: { captcha_token: (_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken } }
                    : null)),
                xform: _sessionResponse,
            });
            if (error) {
                throw error;
            }
            if (!data || !data.session || !data.user) {
                const invalidTokenError = new AuthInvalidTokenResponseError();
                return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return this._returnResult({ data: Object.assign({}, data), error });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
        }
    }
    async signInWithSolana(credentials) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        let message;
        let signature;
        if ('message' in credentials) {
            message = credentials.message;
            signature = credentials.signature;
        }
        else {
            const { chain, wallet, statement, options } = credentials;
            let resolvedWallet;
            if (!isBrowser()) {
                if (typeof wallet !== 'object' || !(options === null || options === void 0 ? void 0 : options.url)) {
                    throw new Error('@supabase/auth-js: Both wallet and url must be specified in non-browser environments.');
                }
                resolvedWallet = wallet;
            }
            else if (typeof wallet === 'object') {
                resolvedWallet = wallet;
            }
            else {
                const windowAny = window;
                if ('solana' in windowAny &&
                    typeof windowAny.solana === 'object' &&
                    (('signIn' in windowAny.solana && typeof windowAny.solana.signIn === 'function') ||
                        ('signMessage' in windowAny.solana &&
                            typeof windowAny.solana.signMessage === 'function'))) {
                    resolvedWallet = windowAny.solana;
                }
                else {
                    throw new Error(`@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.`);
                }
            }
            const url = new URL((_a = options === null || options === void 0 ? void 0 : options.url) !== null && _a !== void 0 ? _a : window.location.href);
            if ('signIn' in resolvedWallet && resolvedWallet.signIn) {
                const output = await resolvedWallet.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: new Date().toISOString() }, options === null || options === void 0 ? void 0 : options.signInWithSolana), { 
                    // non-overridable properties
                    version: '1', domain: url.host, uri: url.href }), (statement ? { statement } : null)));
                let outputToProcess;
                if (Array.isArray(output) && output[0] && typeof output[0] === 'object') {
                    outputToProcess = output[0];
                }
                else if (output &&
                    typeof output === 'object' &&
                    'signedMessage' in output &&
                    'signature' in output) {
                    outputToProcess = output;
                }
                else {
                    throw new Error('@supabase/auth-js: Wallet method signIn() returned unrecognized value');
                }
                if ('signedMessage' in outputToProcess &&
                    'signature' in outputToProcess &&
                    (typeof outputToProcess.signedMessage === 'string' ||
                        outputToProcess.signedMessage instanceof Uint8Array) &&
                    outputToProcess.signature instanceof Uint8Array) {
                    message =
                        typeof outputToProcess.signedMessage === 'string'
                            ? outputToProcess.signedMessage
                            : new TextDecoder().decode(outputToProcess.signedMessage);
                    signature = outputToProcess.signature;
                }
                else {
                    throw new Error('@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields');
                }
            }
            else {
                if (!('signMessage' in resolvedWallet) ||
                    typeof resolvedWallet.signMessage !== 'function' ||
                    !('publicKey' in resolvedWallet) ||
                    typeof resolvedWallet !== 'object' ||
                    !resolvedWallet.publicKey ||
                    !('toBase58' in resolvedWallet.publicKey) ||
                    typeof resolvedWallet.publicKey.toBase58 !== 'function') {
                    throw new Error('@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API');
                }
                message = [
                    `${url.host} wants you to sign in with your Solana account:`,
                    resolvedWallet.publicKey.toBase58(),
                    ...(statement ? ['', statement, ''] : ['']),
                    'Version: 1',
                    `URI: ${url.href}`,
                    `Issued At: ${(_c = (_b = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _b === void 0 ? void 0 : _b.issuedAt) !== null && _c !== void 0 ? _c : new Date().toISOString()}`,
                    ...(((_d = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _d === void 0 ? void 0 : _d.notBefore)
                        ? [`Not Before: ${options.signInWithSolana.notBefore}`]
                        : []),
                    ...(((_e = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _e === void 0 ? void 0 : _e.expirationTime)
                        ? [`Expiration Time: ${options.signInWithSolana.expirationTime}`]
                        : []),
                    ...(((_f = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _f === void 0 ? void 0 : _f.chainId)
                        ? [`Chain ID: ${options.signInWithSolana.chainId}`]
                        : []),
                    ...(((_g = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _g === void 0 ? void 0 : _g.nonce) ? [`Nonce: ${options.signInWithSolana.nonce}`] : []),
                    ...(((_h = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _h === void 0 ? void 0 : _h.requestId)
                        ? [`Request ID: ${options.signInWithSolana.requestId}`]
                        : []),
                    ...(((_k = (_j = options === null || options === void 0 ? void 0 : options.signInWithSolana) === null || _j === void 0 ? void 0 : _j.resources) === null || _k === void 0 ? void 0 : _k.length)
                        ? [
                            'Resources',
                            ...options.signInWithSolana.resources.map((resource) => `- ${resource}`),
                        ]
                        : []),
                ].join('\n');
                const maybeSignature = await resolvedWallet.signMessage(new TextEncoder().encode(message), 'utf8');
                if (!maybeSignature || !(maybeSignature instanceof Uint8Array)) {
                    throw new Error('@supabase/auth-js: Wallet signMessage() API returned an recognized value');
                }
                signature = maybeSignature;
            }
        }
        try {
            const { data, error } = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=web3`, {
                headers: this.headers,
                body: Object.assign({ chain: 'solana', message, signature: bytesToBase64URL(signature) }, (((_l = credentials.options) === null || _l === void 0 ? void 0 : _l.captchaToken)
                    ? { gotrue_meta_security: { captcha_token: (_m = credentials.options) === null || _m === void 0 ? void 0 : _m.captchaToken } }
                    : null)),
                xform: _sessionResponse,
            });
            if (error) {
                throw error;
            }
            if (!data || !data.session || !data.user) {
                const invalidTokenError = new AuthInvalidTokenResponseError();
                return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return this._returnResult({ data: Object.assign({}, data), error });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
        }
    }
    async _exchangeCodeForSession(authCode) {
        const storageItem = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        const [codeVerifier, redirectType] = (storageItem !== null && storageItem !== void 0 ? storageItem : '').split('/');
        try {
            if (!codeVerifier && this.flowType === 'pkce') {
                throw new AuthPKCECodeVerifierMissingError();
            }
            const { data, error } = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=pkce`, {
                headers: this.headers,
                body: {
                    auth_code: authCode,
                    code_verifier: codeVerifier,
                },
                xform: _sessionResponse,
            });
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            if (error) {
                throw error;
            }
            if (!data || !data.session || !data.user) {
                const invalidTokenError = new AuthInvalidTokenResponseError();
                return this._returnResult({
                    data: { user: null, session: null, redirectType: null },
                    error: invalidTokenError,
                });
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return this._returnResult({ data: Object.assign(Object.assign({}, data), { redirectType: redirectType !== null && redirectType !== void 0 ? redirectType : null }), error });
        }
        catch (error) {
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            if (isAuthError(error)) {
                return this._returnResult({
                    data: { user: null, session: null, redirectType: null },
                    error,
                });
            }
            throw error;
        }
    }
    /**
     * Allows signing in with an OIDC ID token. The authentication provider used
     * should be enabled and configured.
     */
    async signInWithIdToken(credentials) {
        try {
            const { options, provider, token, access_token, nonce } = credentials;
            const res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=id_token`, {
                headers: this.headers,
                body: {
                    provider,
                    id_token: token,
                    access_token,
                    nonce,
                    gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                },
                xform: _sessionResponse,
            });
            const { data, error } = res;
            if (error) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            else if (!data || !data.session || !data.user) {
                const invalidTokenError = new AuthInvalidTokenResponseError();
                return this._returnResult({ data: { user: null, session: null }, error: invalidTokenError });
            }
            if (data.session) {
                await this._saveSession(data.session);
                await this._notifyAllSubscribers('SIGNED_IN', data.session);
            }
            return this._returnResult({ data, error });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
        }
    }
    /**
     * Log in a user using magiclink or a one-time password (OTP).
     *
     * If the `{{ .ConfirmationURL }}` variable is specified in the email template, a magiclink will be sent.
     * If the `{{ .Token }}` variable is specified in the email template, an OTP will be sent.
     * If you're using phone sign-ins, only an OTP will be sent. You won't be able to send a magiclink for phone sign-ins.
     *
     * Be aware that you may get back an error message that will not distinguish
     * between the cases where the account does not exist or, that the account
     * can only be accessed via social login.
     *
     * Do note that you will need to configure a Whatsapp sender on Twilio
     * if you are using phone sign in with the 'whatsapp' channel. The whatsapp
     * channel is not supported on other providers
     * at this time.
     * This method supports PKCE when an email is passed.
     */
    async signInWithOtp(credentials) {
        var _a, _b, _c, _d, _e;
        try {
            if ('email' in credentials) {
                const { email, options } = credentials;
                let codeChallenge = null;
                let codeChallengeMethod = null;
                if (this.flowType === 'pkce') {
                    ;
                    [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                }
                const { error } = await _request(this.fetch, 'POST', `${this.url}/otp`, {
                    headers: this.headers,
                    body: {
                        email,
                        data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
                        create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                        code_challenge: codeChallenge,
                        code_challenge_method: codeChallengeMethod,
                    },
                    redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                });
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            if ('phone' in credentials) {
                const { phone, options } = credentials;
                const { data, error } = await _request(this.fetch, 'POST', `${this.url}/otp`, {
                    headers: this.headers,
                    body: {
                        phone,
                        data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
                        create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                        channel: (_e = options === null || options === void 0 ? void 0 : options.channel) !== null && _e !== void 0 ? _e : 'sms',
                    },
                });
                return this._returnResult({
                    data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id },
                    error,
                });
            }
            throw new AuthInvalidCredentialsError('You must provide either an email or phone number.');
        }
        catch (error) {
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            if (isAuthError(error)) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
        }
    }
    /**
     * Log in a user given a User supplied OTP or TokenHash received through mobile or email.
     */
    async verifyOtp(params) {
        var _a, _b;
        try {
            let redirectTo = undefined;
            let captchaToken = undefined;
            if ('options' in params) {
                redirectTo = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo;
                captchaToken = (_b = params.options) === null || _b === void 0 ? void 0 : _b.captchaToken;
            }
            const { data, error } = await _request(this.fetch, 'POST', `${this.url}/verify`, {
                headers: this.headers,
                body: Object.assign(Object.assign({}, params), { gotrue_meta_security: { captcha_token: captchaToken } }),
                redirectTo,
                xform: _sessionResponse,
            });
            if (error) {
                throw error;
            }
            if (!data) {
                const tokenVerificationError = new Error('An error occurred on token verification.');
                throw tokenVerificationError;
            }
            const session = data.session;
            const user = data.user;
            if (session === null || session === void 0 ? void 0 : session.access_token) {
                await this._saveSession(session);
                await this._notifyAllSubscribers(params.type == 'recovery' ? 'PASSWORD_RECOVERY' : 'SIGNED_IN', session);
            }
            return this._returnResult({ data: { user, session }, error: null });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
        }
    }
    /**
     * Attempts a single-sign on using an enterprise Identity Provider. A
     * successful SSO attempt will redirect the current page to the identity
     * provider authorization page. The redirect URL is implementation and SSO
     * protocol specific.
     *
     * You can use it by providing a SSO domain. Typically you can extract this
     * domain by asking users for their email address. If this domain is
     * registered on the Auth instance the redirect will use that organization's
     * currently active SSO Identity Provider for the login.
     *
     * If you have built an organization-specific login page, you can use the
     * organization's SSO Identity Provider UUID directly instead.
     */
    async signInWithSSO(params) {
        var _a, _b, _c, _d, _e;
        try {
            let codeChallenge = null;
            let codeChallengeMethod = null;
            if (this.flowType === 'pkce') {
                ;
                [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
            }
            const result = await _request(this.fetch, 'POST', `${this.url}/sso`, {
                body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, ('providerId' in params ? { provider_id: params.providerId } : null)), ('domain' in params ? { domain: params.domain } : null)), { redirect_to: (_b = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo) !== null && _b !== void 0 ? _b : undefined }), (((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken)
                    ? { gotrue_meta_security: { captcha_token: params.options.captchaToken } }
                    : null)), { skip_http_redirect: true, code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
                headers: this.headers,
                xform: _ssoResponse,
            });
            // Automatically redirect in browser unless skipBrowserRedirect is true
            if (((_d = result.data) === null || _d === void 0 ? void 0 : _d.url) && isBrowser() && !((_e = params.options) === null || _e === void 0 ? void 0 : _e.skipBrowserRedirect)) {
                window.location.assign(result.data.url);
            }
            return this._returnResult(result);
        }
        catch (error) {
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            if (isAuthError(error)) {
                return this._returnResult({ data: null, error });
            }
            throw error;
        }
    }
    /**
     * Sends a reauthentication OTP to the user's email or phone number.
     * Requires the user to be signed-in.
     */
    async reauthenticate() {
        await this.initializePromise;
        return await this._acquireLock(this.lockAcquireTimeout, async () => {
            return await this._reauthenticate();
        });
    }
    async _reauthenticate() {
        try {
            return await this._useSession(async (result) => {
                const { data: { session }, error: sessionError, } = result;
                if (sessionError)
                    throw sessionError;
                if (!session)
                    throw new AuthSessionMissingError();
                const { error } = await _request(this.fetch, 'GET', `${this.url}/reauthenticate`, {
                    headers: this.headers,
                    jwt: session.access_token,
                });
                return this._returnResult({ data: { user: null, session: null }, error });
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
        }
    }
    /**
     * Resends an existing signup confirmation email, email change email, SMS OTP or phone change OTP.
     */
    async resend(credentials) {
        try {
            const endpoint = `${this.url}/resend`;
            if ('email' in credentials) {
                const { email, type, options } = credentials;
                const { error } = await _request(this.fetch, 'POST', endpoint, {
                    headers: this.headers,
                    body: {
                        email,
                        type,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                    },
                    redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                });
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            else if ('phone' in credentials) {
                const { phone, type, options } = credentials;
                const { data, error } = await _request(this.fetch, 'POST', endpoint, {
                    headers: this.headers,
                    body: {
                        phone,
                        type,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                    },
                });
                return this._returnResult({
                    data: { user: null, session: null, messageId: data === null || data === void 0 ? void 0 : data.message_id },
                    error,
                });
            }
            throw new AuthInvalidCredentialsError('You must provide either an email or phone number and a type');
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
        }
    }
    /**
     * Returns the session, refreshing it if necessary.
     *
     * The session returned can be null if the session is not detected which can happen in the event a user is not signed-in or has logged out.
     *
     * **IMPORTANT:** This method loads values directly from the storage attached
     * to the client. If that storage is based on request cookies for example,
     * the values in it may not be authentic and therefore it's strongly advised
     * against using this method and its results in such circumstances. A warning
     * will be emitted if this is detected. Use {@link #getUser()} instead.
     */
    async getSession() {
        await this.initializePromise;
        const result = await this._acquireLock(this.lockAcquireTimeout, async () => {
            return this._useSession(async (result) => {
                return result;
            });
        });
        return result;
    }
    /**
     * Acquires a global lock based on the storage key.
     */
    async _acquireLock(acquireTimeout, fn) {
        this._debug('#_acquireLock', 'begin', acquireTimeout);
        try {
            if (this.lockAcquired) {
                const last = this.pendingInLock.length
                    ? this.pendingInLock[this.pendingInLock.length - 1]
                    : Promise.resolve();
                const result = (async () => {
                    await last;
                    return await fn();
                })();
                this.pendingInLock.push((async () => {
                    try {
                        await result;
                    }
                    catch (e) {
                        // we just care if it finished
                    }
                })());
                return result;
            }
            return await this.lock(`lock:${this.storageKey}`, acquireTimeout, async () => {
                this._debug('#_acquireLock', 'lock acquired for storage key', this.storageKey);
                try {
                    this.lockAcquired = true;
                    const result = fn();
                    this.pendingInLock.push((async () => {
                        try {
                            await result;
                        }
                        catch (e) {
                            // we just care if it finished
                        }
                    })());
                    await result;
                    // keep draining the queue until there's nothing to wait on
                    while (this.pendingInLock.length) {
                        const waitOn = [...this.pendingInLock];
                        await Promise.all(waitOn);
                        this.pendingInLock.splice(0, waitOn.length);
                    }
                    return await result;
                }
                finally {
                    this._debug('#_acquireLock', 'lock released for storage key', this.storageKey);
                    this.lockAcquired = false;
                }
            });
        }
        finally {
            this._debug('#_acquireLock', 'end');
        }
    }
    /**
     * Use instead of {@link #getSession} inside the library. It is
     * semantically usually what you want, as getting a session involves some
     * processing afterwards that requires only one client operating on the
     * session at once across multiple tabs or processes.
     */
    async _useSession(fn) {
        this._debug('#_useSession', 'begin');
        try {
            // the use of __loadSession here is the only correct use of the function!
            const result = await this.__loadSession();
            return await fn(result);
        }
        finally {
            this._debug('#_useSession', 'end');
        }
    }
    /**
     * NEVER USE DIRECTLY!
     *
     * Always use {@link #_useSession}.
     */
    async __loadSession() {
        this._debug('#__loadSession()', 'begin');
        if (!this.lockAcquired) {
            this._debug('#__loadSession()', 'used outside of an acquired lock!', new Error().stack);
        }
        try {
            let currentSession = null;
            const maybeSession = await getItemAsync(this.storage, this.storageKey);
            this._debug('#getSession()', 'session from storage', maybeSession);
            if (maybeSession !== null) {
                if (this._isValidSession(maybeSession)) {
                    currentSession = maybeSession;
                }
                else {
                    this._debug('#getSession()', 'session from storage is not valid');
                    await this._removeSession();
                }
            }
            if (!currentSession) {
                return { data: { session: null }, error: null };
            }
            // A session is considered expired before the access token _actually_
            // expires. When the autoRefreshToken option is off (or when the tab is
            // in the background), very eager users of getSession() -- like
            // realtime-js -- might send a valid JWT which will expire by the time it
            // reaches the server.
            const hasExpired = currentSession.expires_at
                ? currentSession.expires_at * 1000 - Date.now() < EXPIRY_MARGIN_MS
                : false;
            this._debug('#__loadSession()', `session has${hasExpired ? '' : ' not'} expired`, 'expires_at', currentSession.expires_at);
            if (!hasExpired) {
                if (this.userStorage) {
                    const maybeUser = (await getItemAsync(this.userStorage, this.storageKey + '-user'));
                    if (maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) {
                        currentSession.user = maybeUser.user;
                    }
                    else {
                        currentSession.user = userNotAvailableProxy();
                    }
                }
                // Wrap the user object with a warning proxy on the server
                // This warns when properties of the user are accessed, not when session.user itself is accessed
                if (this.storage.isServer &&
                    currentSession.user &&
                    !currentSession.user.__isUserNotAvailableProxy) {
                    const suppressWarningRef = { value: this.suppressGetSessionWarning };
                    currentSession.user = insecureUserWarningProxy(currentSession.user, suppressWarningRef);
                    // Update the client-level suppression flag when the proxy suppresses the warning
                    if (suppressWarningRef.value) {
                        this.suppressGetSessionWarning = true;
                    }
                }
                return { data: { session: currentSession }, error: null };
            }
            const { data: session, error } = await this._callRefreshToken(currentSession.refresh_token);
            if (error) {
                return this._returnResult({ data: { session: null }, error });
            }
            return this._returnResult({ data: { session }, error: null });
        }
        finally {
            this._debug('#__loadSession()', 'end');
        }
    }
    /**
     * Gets the current user details if there is an existing session. This method
     * performs a network request to the Supabase Auth server, so the returned
     * value is authentic and can be used to base authorization rules on.
     *
     * @param jwt Takes in an optional access token JWT. If no JWT is provided, the JWT from the current session is used.
     */
    async getUser(jwt) {
        if (jwt) {
            return await this._getUser(jwt);
        }
        await this.initializePromise;
        const result = await this._acquireLock(this.lockAcquireTimeout, async () => {
            return await this._getUser();
        });
        if (result.data.user) {
            this.suppressGetSessionWarning = true;
        }
        return result;
    }
    async _getUser(jwt) {
        try {
            if (jwt) {
                return await _request(this.fetch, 'GET', `${this.url}/user`, {
                    headers: this.headers,
                    jwt: jwt,
                    xform: _userResponse,
                });
            }
            return await this._useSession(async (result) => {
                var _a, _b, _c;
                const { data, error } = result;
                if (error) {
                    throw error;
                }
                // returns an error if there is no access_token or custom authorization header
                if (!((_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) && !this.hasCustomAuthorizationHeader) {
                    return { data: { user: null }, error: new AuthSessionMissingError() };
                }
                return await _request(this.fetch, 'GET', `${this.url}/user`, {
                    headers: this.headers,
                    jwt: (_c = (_b = data.session) === null || _b === void 0 ? void 0 : _b.access_token) !== null && _c !== void 0 ? _c : undefined,
                    xform: _userResponse,
                });
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                if (isAuthSessionMissingError(error)) {
                    // JWT contains a `session_id` which does not correspond to an active
                    // session in the database, indicating the user is signed out.
                    await this._removeSession();
                    await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
                }
                return this._returnResult({ data: { user: null }, error });
            }
            throw error;
        }
    }
    /**
     * Updates user data for a logged in user.
     */
    async updateUser(attributes, options = {}) {
        await this.initializePromise;
        return await this._acquireLock(this.lockAcquireTimeout, async () => {
            return await this._updateUser(attributes, options);
        });
    }
    async _updateUser(attributes, options = {}) {
        try {
            return await this._useSession(async (result) => {
                const { data: sessionData, error: sessionError } = result;
                if (sessionError) {
                    throw sessionError;
                }
                if (!sessionData.session) {
                    throw new AuthSessionMissingError();
                }
                const session = sessionData.session;
                let codeChallenge = null;
                let codeChallengeMethod = null;
                if (this.flowType === 'pkce' && attributes.email != null) {
                    ;
                    [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
                }
                const { data, error: userError } = await _request(this.fetch, 'PUT', `${this.url}/user`, {
                    headers: this.headers,
                    redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                    body: Object.assign(Object.assign({}, attributes), { code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod }),
                    jwt: session.access_token,
                    xform: _userResponse,
                });
                if (userError) {
                    throw userError;
                }
                session.user = data.user;
                await this._saveSession(session);
                await this._notifyAllSubscribers('USER_UPDATED', session);
                return this._returnResult({ data: { user: session.user }, error: null });
            });
        }
        catch (error) {
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            if (isAuthError(error)) {
                return this._returnResult({ data: { user: null }, error });
            }
            throw error;
        }
    }
    /**
     * Sets the session data from the current session. If the current session is expired, setSession will take care of refreshing it to obtain a new session.
     * If the refresh token or access token in the current session is invalid, an error will be thrown.
     * @param currentSession The current session that minimally contains an access token and refresh token.
     */
    async setSession(currentSession) {
        await this.initializePromise;
        return await this._acquireLock(this.lockAcquireTimeout, async () => {
            return await this._setSession(currentSession);
        });
    }
    async _setSession(currentSession) {
        try {
            if (!currentSession.access_token || !currentSession.refresh_token) {
                throw new AuthSessionMissingError();
            }
            const timeNow = Date.now() / 1000;
            let expiresAt = timeNow;
            let hasExpired = true;
            let session = null;
            const { payload } = decodeJWT(currentSession.access_token);
            if (payload.exp) {
                expiresAt = payload.exp;
                hasExpired = expiresAt <= timeNow;
            }
            if (hasExpired) {
                const { data: refreshedSession, error } = await this._callRefreshToken(currentSession.refresh_token);
                if (error) {
                    return this._returnResult({ data: { user: null, session: null }, error: error });
                }
                if (!refreshedSession) {
                    return { data: { user: null, session: null }, error: null };
                }
                session = refreshedSession;
            }
            else {
                const { data, error } = await this._getUser(currentSession.access_token);
                if (error) {
                    throw error;
                }
                session = {
                    access_token: currentSession.access_token,
                    refresh_token: currentSession.refresh_token,
                    user: data.user,
                    token_type: 'bearer',
                    expires_in: expiresAt - timeNow,
                    expires_at: expiresAt,
                };
                await this._saveSession(session);
                await this._notifyAllSubscribers('SIGNED_IN', session);
            }
            return this._returnResult({ data: { user: session.user, session }, error: null });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: { session: null, user: null }, error });
            }
            throw error;
        }
    }
    /**
     * Returns a new session, regardless of expiry status.
     * Takes in an optional current session. If not passed in, then refreshSession() will attempt to retrieve it from getSession().
     * If the current session's refresh token is invalid, an error will be thrown.
     * @param currentSession The current session. If passed in, it must contain a refresh token.
     */
    async refreshSession(currentSession) {
        await this.initializePromise;
        return await this._acquireLock(this.lockAcquireTimeout, async () => {
            return await this._refreshSession(currentSession);
        });
    }
    async _refreshSession(currentSession) {
        try {
            return await this._useSession(async (result) => {
                var _a;
                if (!currentSession) {
                    const { data, error } = result;
                    if (error) {
                        throw error;
                    }
                    currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : undefined;
                }
                if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) {
                    throw new AuthSessionMissingError();
                }
                const { data: session, error } = await this._callRefreshToken(currentSession.refresh_token);
                if (error) {
                    return this._returnResult({ data: { user: null, session: null }, error: error });
                }
                if (!session) {
                    return this._returnResult({ data: { user: null, session: null }, error: null });
                }
                return this._returnResult({ data: { user: session.user, session }, error: null });
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: { user: null, session: null }, error });
            }
            throw error;
        }
    }
    /**
     * Gets the session data from a URL string
     */
    async _getSessionFromURL(params, callbackUrlType) {
        try {
            if (!isBrowser())
                throw new AuthImplicitGrantRedirectError('No browser detected.');
            // If there's an error in the URL, it doesn't matter what flow it is, we just return the error.
            if (params.error || params.error_description || params.error_code) {
                // The error class returned implies that the redirect is from an implicit grant flow
                // but it could also be from a redirect error from a PKCE flow.
                throw new AuthImplicitGrantRedirectError(params.error_description || 'Error in URL with unspecified error_description', {
                    error: params.error || 'unspecified_error',
                    code: params.error_code || 'unspecified_code',
                });
            }
            // Checks for mismatches between the flowType initialised in the client and the URL parameters
            switch (callbackUrlType) {
                case 'implicit':
                    if (this.flowType === 'pkce') {
                        throw new AuthPKCEGrantCodeExchangeError('Not a valid PKCE flow url.');
                    }
                    break;
                case 'pkce':
                    if (this.flowType === 'implicit') {
                        throw new AuthImplicitGrantRedirectError('Not a valid implicit grant flow url.');
                    }
                    break;
                default:
                // there's no mismatch so we continue
            }
            // Since this is a redirect for PKCE, we attempt to retrieve the code from the URL for the code exchange
            if (callbackUrlType === 'pkce') {
                this._debug('#_initialize()', 'begin', 'is PKCE flow', true);
                if (!params.code)
                    throw new AuthPKCEGrantCodeExchangeError('No code detected.');
                const { data, error } = await this._exchangeCodeForSession(params.code);
                if (error)
                    throw error;
                const url = new URL(window.location.href);
                url.searchParams.delete('code');
                window.history.replaceState(window.history.state, '', url.toString());
                return { data: { session: data.session, redirectType: null }, error: null };
            }
            const { provider_token, provider_refresh_token, access_token, refresh_token, expires_in, expires_at, token_type, } = params;
            if (!access_token || !expires_in || !refresh_token || !token_type) {
                throw new AuthImplicitGrantRedirectError('No session defined in URL');
            }
            const timeNow = Math.round(Date.now() / 1000);
            const expiresIn = parseInt(expires_in);
            let expiresAt = timeNow + expiresIn;
            if (expires_at) {
                expiresAt = parseInt(expires_at);
            }
            const actuallyExpiresIn = expiresAt - timeNow;
            if (actuallyExpiresIn * 1000 <= AUTO_REFRESH_TICK_DURATION_MS) {
                console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${actuallyExpiresIn}s, should have been closer to ${expiresIn}s`);
            }
            const issuedAt = expiresAt - expiresIn;
            if (timeNow - issuedAt >= 120) {
                console.warn('@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale', issuedAt, expiresAt, timeNow);
            }
            else if (timeNow - issuedAt < 0) {
                console.warn('@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew', issuedAt, expiresAt, timeNow);
            }
            const { data, error } = await this._getUser(access_token);
            if (error)
                throw error;
            const session = {
                provider_token,
                provider_refresh_token,
                access_token,
                expires_in: expiresIn,
                expires_at: expiresAt,
                refresh_token,
                token_type: token_type,
                user: data.user,
            };
            // Remove tokens from URL
            window.location.hash = '';
            this._debug('#_getSessionFromURL()', 'clearing window.location.hash');
            return this._returnResult({ data: { session, redirectType: params.type }, error: null });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: { session: null, redirectType: null }, error });
            }
            throw error;
        }
    }
    /**
     * Checks if the current URL contains parameters given by an implicit oauth grant flow (https://www.rfc-editor.org/rfc/rfc6749.html#section-4.2)
     *
     * If `detectSessionInUrl` is a function, it will be called with the URL and params to determine
     * if the URL should be processed as a Supabase auth callback. This allows users to exclude
     * URLs from other OAuth providers (e.g., Facebook Login) that also return access_token in the fragment.
     */
    _isImplicitGrantCallback(params) {
        if (typeof this.detectSessionInUrl === 'function') {
            return this.detectSessionInUrl(new URL(window.location.href), params);
        }
        return Boolean(params.access_token || params.error_description);
    }
    /**
     * Checks if the current URL and backing storage contain parameters given by a PKCE flow
     */
    async _isPKCECallback(params) {
        const currentStorageContent = await getItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        return !!(params.code && currentStorageContent);
    }
    /**
     * Inside a browser context, `signOut()` will remove the logged in user from the browser session and log them out - removing all items from localstorage and then trigger a `"SIGNED_OUT"` event.
     *
     * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`.
     * There is no way to revoke a user's access token jwt until it expires. It is recommended to set a shorter expiry on the jwt for this reason.
     *
     * If using `others` scope, no `SIGNED_OUT` event is fired!
     */
    async signOut(options = { scope: 'global' }) {
        await this.initializePromise;
        return await this._acquireLock(this.lockAcquireTimeout, async () => {
            return await this._signOut(options);
        });
    }
    async _signOut({ scope } = { scope: 'global' }) {
        return await this._useSession(async (result) => {
            var _a;
            const { data, error: sessionError } = result;
            if (sessionError) {
                return this._returnResult({ error: sessionError });
            }
            const accessToken = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token;
            if (accessToken) {
                const { error } = await this.admin.signOut(accessToken, scope);
                if (error) {
                    // ignore 404s since user might not exist anymore
                    // ignore 401s since an invalid or expired JWT should sign out the current session
                    if (!(isAuthApiError(error) &&
                        (error.status === 404 || error.status === 401 || error.status === 403))) {
                        return this._returnResult({ error });
                    }
                }
            }
            if (scope !== 'others') {
                await this._removeSession();
                await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            }
            return this._returnResult({ error: null });
        });
    }
    onAuthStateChange(callback) {
        const id = generateCallbackId();
        const subscription = {
            id,
            callback,
            unsubscribe: () => {
                this._debug('#unsubscribe()', 'state change callback with id removed', id);
                this.stateChangeEmitters.delete(id);
            },
        };
        this._debug('#onAuthStateChange()', 'registered callback with id', id);
        this.stateChangeEmitters.set(id, subscription);
        (async () => {
            await this.initializePromise;
            await this._acquireLock(this.lockAcquireTimeout, async () => {
                this._emitInitialSession(id);
            });
        })();
        return { data: { subscription } };
    }
    async _emitInitialSession(id) {
        return await this._useSession(async (result) => {
            var _a, _b;
            try {
                const { data: { session }, error, } = result;
                if (error)
                    throw error;
                await ((_a = this.stateChangeEmitters.get(id)) === null || _a === void 0 ? void 0 : _a.callback('INITIAL_SESSION', session));
                this._debug('INITIAL_SESSION', 'callback id', id, 'session', session);
            }
            catch (err) {
                await ((_b = this.stateChangeEmitters.get(id)) === null || _b === void 0 ? void 0 : _b.callback('INITIAL_SESSION', null));
                this._debug('INITIAL_SESSION', 'callback id', id, 'error', err);
                console.error(err);
            }
        });
    }
    /**
     * Sends a password reset request to an email address. This method supports the PKCE flow.
     *
     * @param email The email address of the user.
     * @param options.redirectTo The URL to send the user to after they click the password reset link.
     * @param options.captchaToken Verification token received when the user completes the captcha on the site.
     */
    async resetPasswordForEmail(email, options = {}) {
        let codeChallenge = null;
        let codeChallengeMethod = null;
        if (this.flowType === 'pkce') {
            [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey, true // isPasswordRecovery
            );
        }
        try {
            return await _request(this.fetch, 'POST', `${this.url}/recover`, {
                body: {
                    email,
                    code_challenge: codeChallenge,
                    code_challenge_method: codeChallengeMethod,
                    gotrue_meta_security: { captcha_token: options.captchaToken },
                },
                headers: this.headers,
                redirectTo: options.redirectTo,
            });
        }
        catch (error) {
            await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
            if (isAuthError(error)) {
                return this._returnResult({ data: null, error });
            }
            throw error;
        }
    }
    /**
     * Gets all the identities linked to a user.
     */
    async getUserIdentities() {
        var _a;
        try {
            const { data, error } = await this.getUser();
            if (error)
                throw error;
            return this._returnResult({ data: { identities: (_a = data.user.identities) !== null && _a !== void 0 ? _a : [] }, error: null });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: null, error });
            }
            throw error;
        }
    }
    async linkIdentity(credentials) {
        if ('token' in credentials) {
            return this.linkIdentityIdToken(credentials);
        }
        return this.linkIdentityOAuth(credentials);
    }
    async linkIdentityOAuth(credentials) {
        var _a;
        try {
            const { data, error } = await this._useSession(async (result) => {
                var _a, _b, _c, _d, _e;
                const { data, error } = result;
                if (error)
                    throw error;
                const url = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, credentials.provider, {
                    redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
                    scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
                    queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams,
                    skipBrowserRedirect: true,
                });
                return await _request(this.fetch, 'GET', url, {
                    headers: this.headers,
                    jwt: (_e = (_d = data.session) === null || _d === void 0 ? void 0 : _d.access_token) !== null && _e !== void 0 ? _e : undefined,
                });
            });
            if (error)
                throw error;
            if (isBrowser() && !((_a = credentials.options) === null || _a === void 0 ? void 0 : _a.skipBrowserRedirect)) {
                window.location.assign(data === null || data === void 0 ? void 0 : data.url);
            }
            return this._returnResult({
                data: { provider: credentials.provider, url: data === null || data === void 0 ? void 0 : data.url },
                error: null,
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: { provider: credentials.provider, url: null }, error });
            }
            throw error;
        }
    }
    async linkIdentityIdToken(credentials) {
        return await this._useSession(async (result) => {
            var _a;
            try {
                const { error: sessionError, data: { session }, } = result;
                if (sessionError)
                    throw sessionError;
                const { options, provider, token, access_token, nonce } = credentials;
                const res = await _request(this.fetch, 'POST', `${this.url}/token?grant_type=id_token`, {
                    headers: this.headers,
                    jwt: (_a = session === null || session === void 0 ? void 0 : session.access_token) !== null && _a !== void 0 ? _a : undefined,
                    body: {
                        provider,
                        id_token: token,
                        access_token,
                        nonce,
                        link_identity: true,
                        gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken },
                    },
                    xform: _sessionResponse,
                });
                const { data, error } = res;
                if (error) {
                    return this._returnResult({ data: { user: null, session: null }, error });
                }
                else if (!data || !data.session || !data.user) {
                    return this._returnResult({
                        data: { user: null, session: null },
                        error: new AuthInvalidTokenResponseError(),
                    });
                }
                if (data.session) {
                    await this._saveSession(data.session);
                    await this._notifyAllSubscribers('USER_UPDATED', data.session);
                }
                return this._returnResult({ data, error });
            }
            catch (error) {
                await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
                if (isAuthError(error)) {
                    return this._returnResult({ data: { user: null, session: null }, error });
                }
                throw error;
            }
        });
    }
    /**
     * Unlinks an identity from a user by deleting it. The user will no longer be able to sign in with that identity once it's unlinked.
     */
    async unlinkIdentity(identity) {
        try {
            return await this._useSession(async (result) => {
                var _a, _b;
                const { data, error } = result;
                if (error) {
                    throw error;
                }
                return await _request(this.fetch, 'DELETE', `${this.url}/user/identities/${identity.identity_id}`, {
                    headers: this.headers,
                    jwt: (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : undefined,
                });
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: null, error });
            }
            throw error;
        }
    }
    /**
     * Generates a new JWT.
     * @param refreshToken A valid refresh token that was returned on login.
     */
    async _refreshAccessToken(refreshToken) {
        const debugName = `#_refreshAccessToken(${refreshToken.substring(0, 5)}...)`;
        this._debug(debugName, 'begin');
        try {
            const startedAt = Date.now();
            // will attempt to refresh the token with exponential backoff
            return await retryable(async (attempt) => {
                if (attempt > 0) {
                    await sleep(200 * Math.pow(2, attempt - 1)); // 200, 400, 800, ...
                }
                this._debug(debugName, 'refreshing attempt', attempt);
                return await _request(this.fetch, 'POST', `${this.url}/token?grant_type=refresh_token`, {
                    body: { refresh_token: refreshToken },
                    headers: this.headers,
                    xform: _sessionResponse,
                });
            }, (attempt, error) => {
                const nextBackOffInterval = 200 * Math.pow(2, attempt);
                return (error &&
                    isAuthRetryableFetchError(error) &&
                    // retryable only if the request can be sent before the backoff overflows the tick duration
                    Date.now() + nextBackOffInterval - startedAt < AUTO_REFRESH_TICK_DURATION_MS);
            });
        }
        catch (error) {
            this._debug(debugName, 'error', error);
            if (isAuthError(error)) {
                return this._returnResult({ data: { session: null, user: null }, error });
            }
            throw error;
        }
        finally {
            this._debug(debugName, 'end');
        }
    }
    _isValidSession(maybeSession) {
        const isValidSession = typeof maybeSession === 'object' &&
            maybeSession !== null &&
            'access_token' in maybeSession &&
            'refresh_token' in maybeSession &&
            'expires_at' in maybeSession;
        return isValidSession;
    }
    async _handleProviderSignIn(provider, options) {
        const url = await this._getUrlForProvider(`${this.url}/authorize`, provider, {
            redirectTo: options.redirectTo,
            scopes: options.scopes,
            queryParams: options.queryParams,
        });
        this._debug('#_handleProviderSignIn()', 'provider', provider, 'options', options, 'url', url);
        // try to open on the browser
        if (isBrowser() && !options.skipBrowserRedirect) {
            window.location.assign(url);
        }
        return { data: { provider, url }, error: null };
    }
    /**
     * Recovers the session from LocalStorage and refreshes the token
     * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
     */
    async _recoverAndRefresh() {
        var _a, _b;
        const debugName = '#_recoverAndRefresh()';
        this._debug(debugName, 'begin');
        try {
            const currentSession = (await getItemAsync(this.storage, this.storageKey));
            if (currentSession && this.userStorage) {
                let maybeUser = (await getItemAsync(this.userStorage, this.storageKey + '-user'));
                if (!this.storage.isServer && Object.is(this.storage, this.userStorage) && !maybeUser) {
                    // storage and userStorage are the same storage medium, for example
                    // window.localStorage if userStorage does not have the user from
                    // storage stored, store it first thereby migrating the user object
                    // from storage -> userStorage
                    maybeUser = { user: currentSession.user };
                    await setItemAsync(this.userStorage, this.storageKey + '-user', maybeUser);
                }
                currentSession.user = (_a = maybeUser === null || maybeUser === void 0 ? void 0 : maybeUser.user) !== null && _a !== void 0 ? _a : userNotAvailableProxy();
            }
            else if (currentSession && !currentSession.user) {
                // user storage is not set, let's check if it was previously enabled so
                // we bring back the storage as it should be
                if (!currentSession.user) {
                    // test if userStorage was previously enabled and the storage medium was the same, to move the user back under the same key
                    const separateUser = (await getItemAsync(this.storage, this.storageKey + '-user'));
                    if (separateUser && (separateUser === null || separateUser === void 0 ? void 0 : separateUser.user)) {
                        currentSession.user = separateUser.user;
                        await removeItemAsync(this.storage, this.storageKey + '-user');
                        await setItemAsync(this.storage, this.storageKey, currentSession);
                    }
                    else {
                        currentSession.user = userNotAvailableProxy();
                    }
                }
            }
            this._debug(debugName, 'session from storage', currentSession);
            if (!this._isValidSession(currentSession)) {
                this._debug(debugName, 'session is not valid');
                if (currentSession !== null) {
                    await this._removeSession();
                }
                return;
            }
            const expiresWithMargin = ((_b = currentSession.expires_at) !== null && _b !== void 0 ? _b : Infinity) * 1000 - Date.now() < EXPIRY_MARGIN_MS;
            this._debug(debugName, `session has${expiresWithMargin ? '' : ' not'} expired with margin of ${EXPIRY_MARGIN_MS}s`);
            if (expiresWithMargin) {
                if (this.autoRefreshToken && currentSession.refresh_token) {
                    const { error } = await this._callRefreshToken(currentSession.refresh_token);
                    if (error) {
                        console.error(error);
                        if (!isAuthRetryableFetchError(error)) {
                            this._debug(debugName, 'refresh failed with a non-retryable error, removing the session', error);
                            await this._removeSession();
                        }
                    }
                }
            }
            else if (currentSession.user &&
                currentSession.user.__isUserNotAvailableProxy === true) {
                // If we have a proxy user, try to get the real user data
                try {
                    const { data, error: userError } = await this._getUser(currentSession.access_token);
                    if (!userError && (data === null || data === void 0 ? void 0 : data.user)) {
                        currentSession.user = data.user;
                        await this._saveSession(currentSession);
                        await this._notifyAllSubscribers('SIGNED_IN', currentSession);
                    }
                    else {
                        this._debug(debugName, 'could not get user data, skipping SIGNED_IN notification');
                    }
                }
                catch (getUserError) {
                    console.error('Error getting user data:', getUserError);
                    this._debug(debugName, 'error getting user data, skipping SIGNED_IN notification', getUserError);
                }
            }
            else {
                // no need to persist currentSession again, as we just loaded it from
                // local storage; persisting it again may overwrite a value saved by
                // another client with access to the same local storage
                await this._notifyAllSubscribers('SIGNED_IN', currentSession);
            }
        }
        catch (err) {
            this._debug(debugName, 'error', err);
            console.error(err);
            return;
        }
        finally {
            this._debug(debugName, 'end');
        }
    }
    async _callRefreshToken(refreshToken) {
        var _a, _b;
        if (!refreshToken) {
            throw new AuthSessionMissingError();
        }
        // refreshing is already in progress
        if (this.refreshingDeferred) {
            return this.refreshingDeferred.promise;
        }
        const debugName = `#_callRefreshToken(${refreshToken.substring(0, 5)}...)`;
        this._debug(debugName, 'begin');
        try {
            this.refreshingDeferred = new Deferred();
            const { data, error } = await this._refreshAccessToken(refreshToken);
            if (error)
                throw error;
            if (!data.session)
                throw new AuthSessionMissingError();
            await this._saveSession(data.session);
            await this._notifyAllSubscribers('TOKEN_REFRESHED', data.session);
            const result = { data: data.session, error: null };
            this.refreshingDeferred.resolve(result);
            return result;
        }
        catch (error) {
            this._debug(debugName, 'error', error);
            if (isAuthError(error)) {
                const result = { data: null, error };
                if (!isAuthRetryableFetchError(error)) {
                    await this._removeSession();
                }
                (_a = this.refreshingDeferred) === null || _a === void 0 ? void 0 : _a.resolve(result);
                return result;
            }
            (_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error);
            throw error;
        }
        finally {
            this.refreshingDeferred = null;
            this._debug(debugName, 'end');
        }
    }
    async _notifyAllSubscribers(event, session, broadcast = true) {
        const debugName = `#_notifyAllSubscribers(${event})`;
        this._debug(debugName, 'begin', session, `broadcast = ${broadcast}`);
        try {
            if (this.broadcastChannel && broadcast) {
                this.broadcastChannel.postMessage({ event, session });
            }
            const errors = [];
            const promises = Array.from(this.stateChangeEmitters.values()).map(async (x) => {
                try {
                    await x.callback(event, session);
                }
                catch (e) {
                    errors.push(e);
                }
            });
            await Promise.all(promises);
            if (errors.length > 0) {
                for (let i = 0; i < errors.length; i += 1) {
                    console.error(errors[i]);
                }
                throw errors[0];
            }
        }
        finally {
            this._debug(debugName, 'end');
        }
    }
    /**
     * set currentSession and currentUser
     * process to _startAutoRefreshToken if possible
     */
    async _saveSession(session) {
        this._debug('#_saveSession()', session);
        // _saveSession is always called whenever a new session has been acquired
        // so we can safely suppress the warning returned by future getSession calls
        this.suppressGetSessionWarning = true;
        await removeItemAsync(this.storage, `${this.storageKey}-code-verifier`);
        // Create a shallow copy to work with, to avoid mutating the original session object if it's used elsewhere
        const sessionToProcess = Object.assign({}, session);
        const userIsProxy = sessionToProcess.user && sessionToProcess.user.__isUserNotAvailableProxy === true;
        if (this.userStorage) {
            if (!userIsProxy && sessionToProcess.user) {
                // If it's a real user object, save it to userStorage.
                await setItemAsync(this.userStorage, this.storageKey + '-user', {
                    user: sessionToProcess.user,
                });
            }
            // Prepare the main session data for primary storage: remove the user property before cloning
            // This is important because the original session.user might be the proxy
            const mainSessionData = Object.assign({}, sessionToProcess);
            delete mainSessionData.user; // Remove user (real or proxy) before cloning for main storage
            const clonedMainSessionData = deepClone(mainSessionData);
            await setItemAsync(this.storage, this.storageKey, clonedMainSessionData);
        }
        else {
            // No userStorage is configured.
            // In this case, session.user should ideally not be a proxy.
            // If it were, structuredClone would fail. This implies an issue elsewhere if user is a proxy here
            const clonedSession = deepClone(sessionToProcess); // sessionToProcess still has its original user property
            await setItemAsync(this.storage, this.storageKey, clonedSession);
        }
    }
    async _removeSession() {
        this._debug('#_removeSession()');
        this.suppressGetSessionWarning = false;
        await removeItemAsync(this.storage, this.storageKey);
        await removeItemAsync(this.storage, this.storageKey + '-code-verifier');
        await removeItemAsync(this.storage, this.storageKey + '-user');
        if (this.userStorage) {
            await removeItemAsync(this.userStorage, this.storageKey + '-user');
        }
        await this._notifyAllSubscribers('SIGNED_OUT', null);
    }
    /**
     * Removes any registered visibilitychange callback.
     *
     * {@see #startAutoRefresh}
     * {@see #stopAutoRefresh}
     */
    _removeVisibilityChangedCallback() {
        this._debug('#_removeVisibilityChangedCallback()');
        const callback = this.visibilityChangedCallback;
        this.visibilityChangedCallback = null;
        try {
            if (callback && isBrowser() && (window === null || window === void 0 ? void 0 : window.removeEventListener)) {
                window.removeEventListener('visibilitychange', callback);
            }
        }
        catch (e) {
            console.error('removing visibilitychange callback failed', e);
        }
    }
    /**
     * This is the private implementation of {@link #startAutoRefresh}. Use this
     * within the library.
     */
    async _startAutoRefresh() {
        await this._stopAutoRefresh();
        this._debug('#_startAutoRefresh()');
        const ticker = setInterval(() => this._autoRefreshTokenTick(), AUTO_REFRESH_TICK_DURATION_MS);
        this.autoRefreshTicker = ticker;
        if (ticker && typeof ticker === 'object' && typeof ticker.unref === 'function') {
            // ticker is a NodeJS Timeout object that has an `unref` method
            // https://nodejs.org/api/timers.html#timeoutunref
            // When auto refresh is used in NodeJS (like for testing) the
            // `setInterval` is preventing the process from being marked as
            // finished and tests run endlessly. This can be prevented by calling
            // `unref()` on the returned object.
            ticker.unref();
            // @ts-expect-error TS has no context of Deno
        }
        else if (typeof Deno !== 'undefined' && typeof Deno.unrefTimer === 'function') {
            // similar like for NodeJS, but with the Deno API
            // https://deno.land/api@latest?unstable&s=Deno.unrefTimer
            // @ts-expect-error TS has no context of Deno
            Deno.unrefTimer(ticker);
        }
        // run the tick immediately, but in the next pass of the event loop so that
        // #_initialize can be allowed to complete without recursively waiting on
        // itself
        const timeout = setTimeout(async () => {
            await this.initializePromise;
            await this._autoRefreshTokenTick();
        }, 0);
        this.autoRefreshTickTimeout = timeout;
        if (timeout && typeof timeout === 'object' && typeof timeout.unref === 'function') {
            timeout.unref();
            // @ts-expect-error TS has no context of Deno
        }
        else if (typeof Deno !== 'undefined' && typeof Deno.unrefTimer === 'function') {
            // @ts-expect-error TS has no context of Deno
            Deno.unrefTimer(timeout);
        }
    }
    /**
     * This is the private implementation of {@link #stopAutoRefresh}. Use this
     * within the library.
     */
    async _stopAutoRefresh() {
        this._debug('#_stopAutoRefresh()');
        const ticker = this.autoRefreshTicker;
        this.autoRefreshTicker = null;
        if (ticker) {
            clearInterval(ticker);
        }
        const timeout = this.autoRefreshTickTimeout;
        this.autoRefreshTickTimeout = null;
        if (timeout) {
            clearTimeout(timeout);
        }
    }
    /**
     * Starts an auto-refresh process in the background. The session is checked
     * every few seconds. Close to the time of expiration a process is started to
     * refresh the session. If refreshing fails it will be retried for as long as
     * necessary.
     *
     * If you set the {@link GoTrueClientOptions#autoRefreshToken} you don't need
     * to call this function, it will be called for you.
     *
     * On browsers the refresh process works only when the tab/window is in the
     * foreground to conserve resources as well as prevent race conditions and
     * flooding auth with requests. If you call this method any managed
     * visibility change callback will be removed and you must manage visibility
     * changes on your own.
     *
     * On non-browser platforms the refresh process works *continuously* in the
     * background, which may not be desirable. You should hook into your
     * platform's foreground indication mechanism and call these methods
     * appropriately to conserve resources.
     *
     * {@see #stopAutoRefresh}
     */
    async startAutoRefresh() {
        this._removeVisibilityChangedCallback();
        await this._startAutoRefresh();
    }
    /**
     * Stops an active auto refresh process running in the background (if any).
     *
     * If you call this method any managed visibility change callback will be
     * removed and you must manage visibility changes on your own.
     *
     * See {@link #startAutoRefresh} for more details.
     */
    async stopAutoRefresh() {
        this._removeVisibilityChangedCallback();
        await this._stopAutoRefresh();
    }
    /**
     * Runs the auto refresh token tick.
     */
    async _autoRefreshTokenTick() {
        this._debug('#_autoRefreshTokenTick()', 'begin');
        try {
            await this._acquireLock(0, async () => {
                try {
                    const now = Date.now();
                    try {
                        return await this._useSession(async (result) => {
                            const { data: { session }, } = result;
                            if (!session || !session.refresh_token || !session.expires_at) {
                                this._debug('#_autoRefreshTokenTick()', 'no session');
                                return;
                            }
                            // session will expire in this many ticks (or has already expired if <= 0)
                            const expiresInTicks = Math.floor((session.expires_at * 1000 - now) / AUTO_REFRESH_TICK_DURATION_MS);
                            this._debug('#_autoRefreshTokenTick()', `access token expires in ${expiresInTicks} ticks, a tick lasts ${AUTO_REFRESH_TICK_DURATION_MS}ms, refresh threshold is ${AUTO_REFRESH_TICK_THRESHOLD} ticks`);
                            if (expiresInTicks <= AUTO_REFRESH_TICK_THRESHOLD) {
                                await this._callRefreshToken(session.refresh_token);
                            }
                        });
                    }
                    catch (e) {
                        console.error('Auto refresh tick failed with error. This is likely a transient error.', e);
                    }
                }
                finally {
                    this._debug('#_autoRefreshTokenTick()', 'end');
                }
            });
        }
        catch (e) {
            if (e.isAcquireTimeout || e instanceof LockAcquireTimeoutError) {
                this._debug('auto refresh token tick lock not available');
            }
            else {
                throw e;
            }
        }
    }
    /**
     * Registers callbacks on the browser / platform, which in-turn run
     * algorithms when the browser window/tab are in foreground. On non-browser
     * platforms it assumes always foreground.
     */
    async _handleVisibilityChange() {
        this._debug('#_handleVisibilityChange()');
        if (!isBrowser() || !(window === null || window === void 0 ? void 0 : window.addEventListener)) {
            if (this.autoRefreshToken) {
                // in non-browser environments the refresh token ticker runs always
                this.startAutoRefresh();
            }
            return false;
        }
        try {
            this.visibilityChangedCallback = async () => await this._onVisibilityChanged(false);
            window === null || window === void 0 ? void 0 : window.addEventListener('visibilitychange', this.visibilityChangedCallback);
            // now immediately call the visbility changed callback to setup with the
            // current visbility state
            await this._onVisibilityChanged(true); // initial call
        }
        catch (error) {
            console.error('_handleVisibilityChange', error);
        }
    }
    /**
     * Callback registered with `window.addEventListener('visibilitychange')`.
     */
    async _onVisibilityChanged(calledFromInitialize) {
        const methodName = `#_onVisibilityChanged(${calledFromInitialize})`;
        this._debug(methodName, 'visibilityState', document.visibilityState);
        if (document.visibilityState === 'visible') {
            if (this.autoRefreshToken) {
                // in browser environments the refresh token ticker runs only on focused tabs
                // which prevents race conditions
                this._startAutoRefresh();
            }
            if (!calledFromInitialize) {
                // called when the visibility has changed, i.e. the browser
                // transitioned from hidden -> visible so we need to see if the session
                // should be recovered immediately... but to do that we need to acquire
                // the lock first asynchronously
                await this.initializePromise;
                await this._acquireLock(this.lockAcquireTimeout, async () => {
                    if (document.visibilityState !== 'visible') {
                        this._debug(methodName, 'acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting');
                        // visibility has changed while waiting for the lock, abort
                        return;
                    }
                    // recover the session
                    await this._recoverAndRefresh();
                });
            }
        }
        else if (document.visibilityState === 'hidden') {
            if (this.autoRefreshToken) {
                this._stopAutoRefresh();
            }
        }
    }
    /**
     * Generates the relevant login URL for a third-party provider.
     * @param options.redirectTo A URL or mobile address to send the user to after they are confirmed.
     * @param options.scopes A space-separated list of scopes granted to the OAuth application.
     * @param options.queryParams An object of key-value pairs containing query parameters granted to the OAuth application.
     */
    async _getUrlForProvider(url, provider, options) {
        const urlParams = [`provider=${encodeURIComponent(provider)}`];
        if (options === null || options === void 0 ? void 0 : options.redirectTo) {
            urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
        }
        if (options === null || options === void 0 ? void 0 : options.scopes) {
            urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
        }
        if (this.flowType === 'pkce') {
            const [codeChallenge, codeChallengeMethod] = await getCodeChallengeAndMethod(this.storage, this.storageKey);
            const flowParams = new URLSearchParams({
                code_challenge: `${encodeURIComponent(codeChallenge)}`,
                code_challenge_method: `${encodeURIComponent(codeChallengeMethod)}`,
            });
            urlParams.push(flowParams.toString());
        }
        if (options === null || options === void 0 ? void 0 : options.queryParams) {
            const query = new URLSearchParams(options.queryParams);
            urlParams.push(query.toString());
        }
        if (options === null || options === void 0 ? void 0 : options.skipBrowserRedirect) {
            urlParams.push(`skip_http_redirect=${options.skipBrowserRedirect}`);
        }
        return `${url}?${urlParams.join('&')}`;
    }
    async _unenroll(params) {
        try {
            return await this._useSession(async (result) => {
                var _a;
                const { data: sessionData, error: sessionError } = result;
                if (sessionError) {
                    return this._returnResult({ data: null, error: sessionError });
                }
                return await _request(this.fetch, 'DELETE', `${this.url}/factors/${params.factorId}`, {
                    headers: this.headers,
                    jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                });
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: null, error });
            }
            throw error;
        }
    }
    async _enroll(params) {
        try {
            return await this._useSession(async (result) => {
                var _a, _b;
                const { data: sessionData, error: sessionError } = result;
                if (sessionError) {
                    return this._returnResult({ data: null, error: sessionError });
                }
                const body = Object.assign({ friendly_name: params.friendlyName, factor_type: params.factorType }, (params.factorType === 'phone'
                    ? { phone: params.phone }
                    : params.factorType === 'totp'
                        ? { issuer: params.issuer }
                        : {}));
                const { data, error } = (await _request(this.fetch, 'POST', `${this.url}/factors`, {
                    body,
                    headers: this.headers,
                    jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                }));
                if (error) {
                    return this._returnResult({ data: null, error });
                }
                if (params.factorType === 'totp' && data.type === 'totp' && ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code)) {
                    data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
                }
                return this._returnResult({ data, error: null });
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: null, error });
            }
            throw error;
        }
    }
    async _verify(params) {
        return this._acquireLock(this.lockAcquireTimeout, async () => {
            try {
                return await this._useSession(async (result) => {
                    var _a;
                    const { data: sessionData, error: sessionError } = result;
                    if (sessionError) {
                        return this._returnResult({ data: null, error: sessionError });
                    }
                    const body = Object.assign({ challenge_id: params.challengeId }, ('webauthn' in params
                        ? {
                            webauthn: Object.assign(Object.assign({}, params.webauthn), { credential_response: params.webauthn.type === 'create'
                                    ? serializeCredentialCreationResponse(params.webauthn.credential_response)
                                    : serializeCredentialRequestResponse(params.webauthn.credential_response) }),
                        }
                        : { code: params.code }));
                    const { data, error } = await _request(this.fetch, 'POST', `${this.url}/factors/${params.factorId}/verify`, {
                        body,
                        headers: this.headers,
                        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                    });
                    if (error) {
                        return this._returnResult({ data: null, error });
                    }
                    await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1000) + data.expires_in }, data));
                    await this._notifyAllSubscribers('MFA_CHALLENGE_VERIFIED', data);
                    return this._returnResult({ data, error });
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return this._returnResult({ data: null, error });
                }
                throw error;
            }
        });
    }
    async _challenge(params) {
        return this._acquireLock(this.lockAcquireTimeout, async () => {
            try {
                return await this._useSession(async (result) => {
                    var _a;
                    const { data: sessionData, error: sessionError } = result;
                    if (sessionError) {
                        return this._returnResult({ data: null, error: sessionError });
                    }
                    const response = (await _request(this.fetch, 'POST', `${this.url}/factors/${params.factorId}/challenge`, {
                        body: params,
                        headers: this.headers,
                        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token,
                    }));
                    if (response.error) {
                        return response;
                    }
                    const { data } = response;
                    if (data.type !== 'webauthn') {
                        return { data, error: null };
                    }
                    switch (data.webauthn.type) {
                        case 'create':
                            return {
                                data: Object.assign(Object.assign({}, data), { webauthn: Object.assign(Object.assign({}, data.webauthn), { credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), { publicKey: deserializeCredentialCreationOptions(data.webauthn.credential_options.publicKey) }) }) }),
                                error: null,
                            };
                        case 'request':
                            return {
                                data: Object.assign(Object.assign({}, data), { webauthn: Object.assign(Object.assign({}, data.webauthn), { credential_options: Object.assign(Object.assign({}, data.webauthn.credential_options), { publicKey: deserializeCredentialRequestOptions(data.webauthn.credential_options.publicKey) }) }) }),
                                error: null,
                            };
                    }
                });
            }
            catch (error) {
                if (isAuthError(error)) {
                    return this._returnResult({ data: null, error });
                }
                throw error;
            }
        });
    }
    /**
     * {@see GoTrueMFAApi#challengeAndVerify}
     */
    async _challengeAndVerify(params) {
        // both _challenge and _verify independently acquire the lock, so no need
        // to acquire it here
        const { data: challengeData, error: challengeError } = await this._challenge({
            factorId: params.factorId,
        });
        if (challengeError) {
            return this._returnResult({ data: null, error: challengeError });
        }
        return await this._verify({
            factorId: params.factorId,
            challengeId: challengeData.id,
            code: params.code,
        });
    }
    /**
     * {@see GoTrueMFAApi#listFactors}
     */
    async _listFactors() {
        var _a;
        // use #getUser instead of #_getUser as the former acquires a lock
        const { data: { user }, error: userError, } = await this.getUser();
        if (userError) {
            return { data: null, error: userError };
        }
        const data = {
            all: [],
            phone: [],
            totp: [],
            webauthn: [],
        };
        // loop over the factors ONCE
        for (const factor of (_a = user === null || user === void 0 ? void 0 : user.factors) !== null && _a !== void 0 ? _a : []) {
            data.all.push(factor);
            if (factor.status === 'verified') {
                data[factor.factor_type].push(factor);
            }
        }
        return {
            data,
            error: null,
        };
    }
    /**
     * {@see GoTrueMFAApi#getAuthenticatorAssuranceLevel}
     */
    async _getAuthenticatorAssuranceLevel() {
        var _a, _b;
        const { data: { session }, error: sessionError, } = await this.getSession();
        if (sessionError) {
            return this._returnResult({ data: null, error: sessionError });
        }
        if (!session) {
            return {
                data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
                error: null,
            };
        }
        const { payload } = decodeJWT(session.access_token);
        let currentLevel = null;
        if (payload.aal) {
            currentLevel = payload.aal;
        }
        let nextLevel = currentLevel;
        const verifiedFactors = (_b = (_a = session.user.factors) === null || _a === void 0 ? void 0 : _a.filter((factor) => factor.status === 'verified')) !== null && _b !== void 0 ? _b : [];
        if (verifiedFactors.length > 0) {
            nextLevel = 'aal2';
        }
        const currentAuthenticationMethods = payload.amr || [];
        return { data: { currentLevel, nextLevel, currentAuthenticationMethods }, error: null };
    }
    /**
     * Retrieves details about an OAuth authorization request.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     *
     * Returns authorization details including client info, scopes, and user information.
     * If the API returns a redirect_uri, it means consent was already given - the caller
     * should handle the redirect manually if needed.
     */
    async _getAuthorizationDetails(authorizationId) {
        try {
            return await this._useSession(async (result) => {
                const { data: { session }, error: sessionError, } = result;
                if (sessionError) {
                    return this._returnResult({ data: null, error: sessionError });
                }
                if (!session) {
                    return this._returnResult({ data: null, error: new AuthSessionMissingError() });
                }
                return await _request(this.fetch, 'GET', `${this.url}/oauth/authorizations/${authorizationId}`, {
                    headers: this.headers,
                    jwt: session.access_token,
                    xform: (data) => ({ data, error: null }),
                });
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: null, error });
            }
            throw error;
        }
    }
    /**
     * Approves an OAuth authorization request.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     */
    async _approveAuthorization(authorizationId, options) {
        try {
            return await this._useSession(async (result) => {
                const { data: { session }, error: sessionError, } = result;
                if (sessionError) {
                    return this._returnResult({ data: null, error: sessionError });
                }
                if (!session) {
                    return this._returnResult({ data: null, error: new AuthSessionMissingError() });
                }
                const response = await _request(this.fetch, 'POST', `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
                    headers: this.headers,
                    jwt: session.access_token,
                    body: { action: 'approve' },
                    xform: (data) => ({ data, error: null }),
                });
                if (response.data && response.data.redirect_url) {
                    // Automatically redirect in browser unless skipBrowserRedirect is true
                    if (isBrowser() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) {
                        window.location.assign(response.data.redirect_url);
                    }
                }
                return response;
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: null, error });
            }
            throw error;
        }
    }
    /**
     * Denies an OAuth authorization request.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     */
    async _denyAuthorization(authorizationId, options) {
        try {
            return await this._useSession(async (result) => {
                const { data: { session }, error: sessionError, } = result;
                if (sessionError) {
                    return this._returnResult({ data: null, error: sessionError });
                }
                if (!session) {
                    return this._returnResult({ data: null, error: new AuthSessionMissingError() });
                }
                const response = await _request(this.fetch, 'POST', `${this.url}/oauth/authorizations/${authorizationId}/consent`, {
                    headers: this.headers,
                    jwt: session.access_token,
                    body: { action: 'deny' },
                    xform: (data) => ({ data, error: null }),
                });
                if (response.data && response.data.redirect_url) {
                    // Automatically redirect in browser unless skipBrowserRedirect is true
                    if (isBrowser() && !(options === null || options === void 0 ? void 0 : options.skipBrowserRedirect)) {
                        window.location.assign(response.data.redirect_url);
                    }
                }
                return response;
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: null, error });
            }
            throw error;
        }
    }
    /**
     * Lists all OAuth grants that the authenticated user has authorized.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     */
    async _listOAuthGrants() {
        try {
            return await this._useSession(async (result) => {
                const { data: { session }, error: sessionError, } = result;
                if (sessionError) {
                    return this._returnResult({ data: null, error: sessionError });
                }
                if (!session) {
                    return this._returnResult({ data: null, error: new AuthSessionMissingError() });
                }
                return await _request(this.fetch, 'GET', `${this.url}/user/oauth/grants`, {
                    headers: this.headers,
                    jwt: session.access_token,
                    xform: (data) => ({ data, error: null }),
                });
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: null, error });
            }
            throw error;
        }
    }
    /**
     * Revokes a user's OAuth grant for a specific client.
     * Only relevant when the OAuth 2.1 server is enabled in Supabase Auth.
     */
    async _revokeOAuthGrant(options) {
        try {
            return await this._useSession(async (result) => {
                const { data: { session }, error: sessionError, } = result;
                if (sessionError) {
                    return this._returnResult({ data: null, error: sessionError });
                }
                if (!session) {
                    return this._returnResult({ data: null, error: new AuthSessionMissingError() });
                }
                await _request(this.fetch, 'DELETE', `${this.url}/user/oauth/grants`, {
                    headers: this.headers,
                    jwt: session.access_token,
                    query: { client_id: options.clientId },
                    noResolveJson: true,
                });
                return { data: {}, error: null };
            });
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: null, error });
            }
            throw error;
        }
    }
    async fetchJwk(kid, jwks = { keys: [] }) {
        // try fetching from the supplied jwks
        let jwk = jwks.keys.find((key) => key.kid === kid);
        if (jwk) {
            return jwk;
        }
        const now = Date.now();
        // try fetching from cache
        jwk = this.jwks.keys.find((key) => key.kid === kid);
        // jwk exists and jwks isn't stale
        if (jwk && this.jwks_cached_at + JWKS_TTL > now) {
            return jwk;
        }
        // jwk isn't cached in memory so we need to fetch it from the well-known endpoint
        const { data, error } = await _request(this.fetch, 'GET', `${this.url}/.well-known/jwks.json`, {
            headers: this.headers,
        });
        if (error) {
            throw error;
        }
        if (!data.keys || data.keys.length === 0) {
            return null;
        }
        this.jwks = data;
        this.jwks_cached_at = now;
        // Find the signing key
        jwk = data.keys.find((key) => key.kid === kid);
        if (!jwk) {
            return null;
        }
        return jwk;
    }
    /**
     * Extracts the JWT claims present in the access token by first verifying the
     * JWT against the server's JSON Web Key Set endpoint
     * `/.well-known/jwks.json` which is often cached, resulting in significantly
     * faster responses. Prefer this method over {@link #getUser} which always
     * sends a request to the Auth server for each JWT.
     *
     * If the project is not using an asymmetric JWT signing key (like ECC or
     * RSA) it always sends a request to the Auth server (similar to {@link
     * #getUser}) to verify the JWT.
     *
     * @param jwt An optional specific JWT you wish to verify, not the one you
     *            can obtain from {@link #getSession}.
     * @param options Various additional options that allow you to customize the
     *                behavior of this method.
     */
    async getClaims(jwt, options = {}) {
        try {
            let token = jwt;
            if (!token) {
                const { data, error } = await this.getSession();
                if (error || !data.session) {
                    return this._returnResult({ data: null, error });
                }
                token = data.session.access_token;
            }
            const { header, payload, signature, raw: { header: rawHeader, payload: rawPayload }, } = decodeJWT(token);
            if (!(options === null || options === void 0 ? void 0 : options.allowExpired)) {
                // Reject expired JWTs should only happen if jwt argument was passed
                validateExp(payload.exp);
            }
            const signingKey = !header.alg ||
                header.alg.startsWith('HS') ||
                !header.kid ||
                !('crypto' in globalThis && 'subtle' in globalThis.crypto)
                ? null
                : await this.fetchJwk(header.kid, (options === null || options === void 0 ? void 0 : options.keys) ? { keys: options.keys } : options === null || options === void 0 ? void 0 : options.jwks);
            // If symmetric algorithm or WebCrypto API is unavailable, fallback to getUser()
            if (!signingKey) {
                const { error } = await this.getUser(token);
                if (error) {
                    throw error;
                }
                // getUser succeeds so the claims in the JWT can be trusted
                return {
                    data: {
                        claims: payload,
                        header,
                        signature,
                    },
                    error: null,
                };
            }
            const algorithm = getAlgorithm(header.alg);
            // Convert JWK to CryptoKey
            const publicKey = await crypto.subtle.importKey('jwk', signingKey, algorithm, true, [
                'verify',
            ]);
            // Verify the signature
            const isValid = await crypto.subtle.verify(algorithm, publicKey, signature, stringToUint8Array(`${rawHeader}.${rawPayload}`));
            if (!isValid) {
                throw new AuthInvalidJwtError('Invalid JWT signature');
            }
            // If verification succeeds, decode and return claims
            return {
                data: {
                    claims: payload,
                    header,
                    signature,
                },
                error: null,
            };
        }
        catch (error) {
            if (isAuthError(error)) {
                return this._returnResult({ data: null, error });
            }
            throw error;
        }
    }
}
GoTrueClient.nextInstanceID = {};

const AuthClient = GoTrueClient;

//#region src/lib/version.ts
const version = "2.91.1";

//#endregion
//#region src/lib/constants.ts
let JS_ENV = "";
if (typeof Deno !== "undefined") JS_ENV = "deno";
else if (typeof document !== "undefined") JS_ENV = "web";
else if (typeof navigator !== "undefined" && navigator.product === "ReactNative") JS_ENV = "react-native";
else JS_ENV = "node";
const DEFAULT_HEADERS = { "X-Client-Info": `supabase-js-${JS_ENV}/${version}` };
const DEFAULT_GLOBAL_OPTIONS = { headers: DEFAULT_HEADERS };
const DEFAULT_DB_OPTIONS = { schema: "public" };
const DEFAULT_AUTH_OPTIONS = {
	autoRefreshToken: true,
	persistSession: true,
	detectSessionInUrl: true,
	flowType: "implicit"
};
const DEFAULT_REALTIME_OPTIONS = {};

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/typeof.js
function _typeof(o) {
	"@babel/helpers - typeof";
	return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o$1) {
		return typeof o$1;
	} : function(o$1) {
		return o$1 && "function" == typeof Symbol && o$1.constructor === Symbol && o$1 !== Symbol.prototype ? "symbol" : typeof o$1;
	}, _typeof(o);
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPrimitive.js
function toPrimitive(t, r) {
	if ("object" != _typeof(t) || !t) return t;
	var e = t[Symbol.toPrimitive];
	if (void 0 !== e) {
		var i = e.call(t, r);
		if ("object" != _typeof(i)) return i;
		throw new TypeError("@@toPrimitive must return a primitive value.");
	}
	return ("string" === r ? String : Number)(t);
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/toPropertyKey.js
function toPropertyKey(t) {
	var i = toPrimitive(t, "string");
	return "symbol" == _typeof(i) ? i : i + "";
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/defineProperty.js
function _defineProperty(e, r, t) {
	return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
		value: t,
		enumerable: true,
		configurable: true,
		writable: true
	}) : e[r] = t, e;
}

//#endregion
//#region \0@oxc-project+runtime@0.101.0/helpers/objectSpread2.js
function ownKeys(e, r) {
	var t = Object.keys(e);
	if (Object.getOwnPropertySymbols) {
		var o = Object.getOwnPropertySymbols(e);
		r && (o = o.filter(function(r$1) {
			return Object.getOwnPropertyDescriptor(e, r$1).enumerable;
		})), t.push.apply(t, o);
	}
	return t;
}
function _objectSpread2(e) {
	for (var r = 1; r < arguments.length; r++) {
		var t = null != arguments[r] ? arguments[r] : {};
		r % 2 ? ownKeys(Object(t), true).forEach(function(r$1) {
			_defineProperty(e, r$1, t[r$1]);
		}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r$1) {
			Object.defineProperty(e, r$1, Object.getOwnPropertyDescriptor(t, r$1));
		});
	}
	return e;
}

//#endregion
//#region src/lib/fetch.ts
const resolveFetch = (customFetch) => {
	if (customFetch) return (...args) => customFetch(...args);
	return (...args) => fetch(...args);
};
const resolveHeadersConstructor = () => {
	return Headers;
};
const fetchWithAuth = (supabaseKey, getAccessToken, customFetch) => {
	const fetch$1 = resolveFetch(customFetch);
	const HeadersConstructor = resolveHeadersConstructor();
	return async (input, init) => {
		var _await$getAccessToken;
		const accessToken = (_await$getAccessToken = await getAccessToken()) !== null && _await$getAccessToken !== void 0 ? _await$getAccessToken : supabaseKey;
		let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
		if (!headers.has("apikey")) headers.set("apikey", supabaseKey);
		if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${accessToken}`);
		return fetch$1(input, _objectSpread2(_objectSpread2({}, init), {}, { headers }));
	};
};

//#endregion
//#region src/lib/helpers.ts
function ensureTrailingSlash(url) {
	return url.endsWith("/") ? url : url + "/";
}
function applySettingDefaults(options, defaults) {
	var _DEFAULT_GLOBAL_OPTIO, _globalOptions$header;
	const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions } = options;
	const { db: DEFAULT_DB_OPTIONS$1, auth: DEFAULT_AUTH_OPTIONS$1, realtime: DEFAULT_REALTIME_OPTIONS$1, global: DEFAULT_GLOBAL_OPTIONS$1 } = defaults;
	const result = {
		db: _objectSpread2(_objectSpread2({}, DEFAULT_DB_OPTIONS$1), dbOptions),
		auth: _objectSpread2(_objectSpread2({}, DEFAULT_AUTH_OPTIONS$1), authOptions),
		realtime: _objectSpread2(_objectSpread2({}, DEFAULT_REALTIME_OPTIONS$1), realtimeOptions),
		storage: {},
		global: _objectSpread2(_objectSpread2(_objectSpread2({}, DEFAULT_GLOBAL_OPTIONS$1), globalOptions), {}, { headers: _objectSpread2(_objectSpread2({}, (_DEFAULT_GLOBAL_OPTIO = DEFAULT_GLOBAL_OPTIONS$1 === null || DEFAULT_GLOBAL_OPTIONS$1 === void 0 ? void 0 : DEFAULT_GLOBAL_OPTIONS$1.headers) !== null && _DEFAULT_GLOBAL_OPTIO !== void 0 ? _DEFAULT_GLOBAL_OPTIO : {}), (_globalOptions$header = globalOptions === null || globalOptions === void 0 ? void 0 : globalOptions.headers) !== null && _globalOptions$header !== void 0 ? _globalOptions$header : {}) }),
		accessToken: async () => ""
	};
	if (options.accessToken) result.accessToken = options.accessToken;
	else delete result.accessToken;
	return result;
}
/**
* Validates a Supabase client URL
*
* @param {string} supabaseUrl - The Supabase client URL string.
* @returns {URL} - The validated base URL.
* @throws {Error}
*/
function validateSupabaseUrl(supabaseUrl) {
	const trimmedUrl = supabaseUrl === null || supabaseUrl === void 0 ? void 0 : supabaseUrl.trim();
	if (!trimmedUrl) throw new Error("supabaseUrl is required.");
	if (!trimmedUrl.match(/^https?:\/\//i)) throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
	try {
		return new URL(ensureTrailingSlash(trimmedUrl));
	} catch (_unused) {
		throw Error("Invalid supabaseUrl: Provided URL is malformed.");
	}
}

//#endregion
//#region src/lib/SupabaseAuthClient.ts
var SupabaseAuthClient = class extends AuthClient {
	constructor(options) {
		super(options);
	}
};

//#endregion
//#region src/SupabaseClient.ts
/**
* Supabase Client.
*
* An isomorphic Javascript client for interacting with Postgres.
*/
var SupabaseClient = class {
	/**
	* Create a new client for use in the browser.
	* @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
	* @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
	* @param options.db.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
	* @param options.auth.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
	* @param options.auth.persistSession Set to "true" if you want to automatically save the user session into local storage.
	* @param options.auth.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
	* @param options.realtime Options passed along to realtime-js constructor.
	* @param options.storage Options passed along to the storage-js constructor.
	* @param options.global.fetch A custom fetch implementation.
	* @param options.global.headers Any additional headers to send with each network request.
	* @example
	* ```ts
	* import { createClient } from '@supabase/supabase-js'
	*
	* const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
	* const { data } = await supabase.from('profiles').select('*')
	* ```
	*/
	constructor(supabaseUrl, supabaseKey, options) {
		var _settings$auth$storag, _settings$global$head;
		this.supabaseUrl = supabaseUrl;
		this.supabaseKey = supabaseKey;
		const baseUrl = validateSupabaseUrl(supabaseUrl);
		if (!supabaseKey) throw new Error("supabaseKey is required.");
		this.realtimeUrl = new URL("realtime/v1", baseUrl);
		this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws");
		this.authUrl = new URL("auth/v1", baseUrl);
		this.storageUrl = new URL("storage/v1", baseUrl);
		this.functionsUrl = new URL("functions/v1", baseUrl);
		const defaultStorageKey = `sb-${baseUrl.hostname.split(".")[0]}-auth-token`;
		const DEFAULTS = {
			db: DEFAULT_DB_OPTIONS,
			realtime: DEFAULT_REALTIME_OPTIONS,
			auth: _objectSpread2(_objectSpread2({}, DEFAULT_AUTH_OPTIONS), {}, { storageKey: defaultStorageKey }),
			global: DEFAULT_GLOBAL_OPTIONS
		};
		const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
		this.storageKey = (_settings$auth$storag = settings.auth.storageKey) !== null && _settings$auth$storag !== void 0 ? _settings$auth$storag : "";
		this.headers = (_settings$global$head = settings.global.headers) !== null && _settings$global$head !== void 0 ? _settings$global$head : {};
		if (!settings.accessToken) {
			var _settings$auth;
			this.auth = this._initSupabaseAuthClient((_settings$auth = settings.auth) !== null && _settings$auth !== void 0 ? _settings$auth : {}, this.headers, settings.global.fetch);
		} else {
			this.accessToken = settings.accessToken;
			this.auth = new Proxy({}, { get: (_, prop) => {
				throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop)} is not possible`);
			} });
		}
		this.fetch = fetchWithAuth(supabaseKey, this._getAccessToken.bind(this), settings.global.fetch);
		this.realtime = this._initRealtimeClient(_objectSpread2({
			headers: this.headers,
			accessToken: this._getAccessToken.bind(this)
		}, settings.realtime));
		if (this.accessToken) Promise.resolve(this.accessToken()).then((token) => this.realtime.setAuth(token)).catch((e) => console.warn("Failed to set initial Realtime auth token:", e));
		this.rest = new PostgrestClient(new URL("rest/v1", baseUrl).href, {
			headers: this.headers,
			schema: settings.db.schema,
			fetch: this.fetch
		});
		this.storage = new StorageClient(this.storageUrl.href, this.headers, this.fetch, options === null || options === void 0 ? void 0 : options.storage);
		if (!settings.accessToken) this._listenForAuthEvents();
	}
	/**
	* Supabase Functions allows you to deploy and invoke edge functions.
	*/
	get functions() {
		return new FunctionsClient(this.functionsUrl.href, {
			headers: this.headers,
			customFetch: this.fetch
		});
	}
	/**
	* Perform a query on a table or a view.
	*
	* @param relation - The table or view name to query
	*/
	from(relation) {
		return this.rest.from(relation);
	}
	/**
	* Select a schema to query or perform an function (rpc) call.
	*
	* The schema needs to be on the list of exposed schemas inside Supabase.
	*
	* @param schema - The schema to query
	*/
	schema(schema) {
		return this.rest.schema(schema);
	}
	/**
	* Perform a function call.
	*
	* @param fn - The function name to call
	* @param args - The arguments to pass to the function call
	* @param options - Named parameters
	* @param options.head - When set to `true`, `data` will not be returned.
	* Useful if you only need the count.
	* @param options.get - When set to `true`, the function will be called with
	* read-only access mode.
	* @param options.count - Count algorithm to use to count rows returned by the
	* function. Only applicable for [set-returning
	* functions](https://www.postgresql.org/docs/current/functions-srf.html).
	*
	* `"exact"`: Exact but slow count algorithm. Performs a `COUNT(*)` under the
	* hood.
	*
	* `"planned"`: Approximated but fast count algorithm. Uses the Postgres
	* statistics under the hood.
	*
	* `"estimated"`: Uses exact count for low numbers and planned count for high
	* numbers.
	*/
	rpc(fn, args = {}, options = {
		head: false,
		get: false,
		count: void 0
	}) {
		return this.rest.rpc(fn, args, options);
	}
	/**
	* Creates a Realtime channel with Broadcast, Presence, and Postgres Changes.
	*
	* @param {string} name - The name of the Realtime channel.
	* @param {Object} opts - The options to pass to the Realtime channel.
	*
	*/
	channel(name, opts = { config: {} }) {
		return this.realtime.channel(name, opts);
	}
	/**
	* Returns all Realtime channels.
	*/
	getChannels() {
		return this.realtime.getChannels();
	}
	/**
	* Unsubscribes and removes Realtime channel from Realtime client.
	*
	* @param {RealtimeChannel} channel - The name of the Realtime channel.
	*
	*/
	removeChannel(channel) {
		return this.realtime.removeChannel(channel);
	}
	/**
	* Unsubscribes and removes all Realtime channels from Realtime client.
	*/
	removeAllChannels() {
		return this.realtime.removeAllChannels();
	}
	async _getAccessToken() {
		var _this = this;
		var _data$session$access_, _data$session;
		if (_this.accessToken) return await _this.accessToken();
		const { data } = await _this.auth.getSession();
		return (_data$session$access_ = (_data$session = data.session) === null || _data$session === void 0 ? void 0 : _data$session.access_token) !== null && _data$session$access_ !== void 0 ? _data$session$access_ : _this.supabaseKey;
	}
	_initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, userStorage, storageKey, flowType, lock, debug, throwOnError }, headers, fetch$1) {
		const authHeaders = {
			Authorization: `Bearer ${this.supabaseKey}`,
			apikey: `${this.supabaseKey}`
		};
		return new SupabaseAuthClient({
			url: this.authUrl.href,
			headers: _objectSpread2(_objectSpread2({}, authHeaders), headers),
			storageKey,
			autoRefreshToken,
			persistSession,
			detectSessionInUrl,
			storage,
			userStorage,
			flowType,
			lock,
			debug,
			throwOnError,
			fetch: fetch$1,
			hasCustomAuthorizationHeader: Object.keys(this.headers).some((key) => key.toLowerCase() === "authorization")
		});
	}
	_initRealtimeClient(options) {
		return new RealtimeClient(this.realtimeUrl.href, _objectSpread2(_objectSpread2({}, options), {}, { params: _objectSpread2(_objectSpread2({}, { apikey: this.supabaseKey }), options === null || options === void 0 ? void 0 : options.params) }));
	}
	_listenForAuthEvents() {
		return this.auth.onAuthStateChange((event, session) => {
			this._handleTokenChanged(event, "CLIENT", session === null || session === void 0 ? void 0 : session.access_token);
		});
	}
	_handleTokenChanged(event, source, token) {
		if ((event === "TOKEN_REFRESHED" || event === "SIGNED_IN") && this.changedAccessToken !== token) {
			this.changedAccessToken = token;
			this.realtime.setAuth(token);
		} else if (event === "SIGNED_OUT") {
			this.realtime.setAuth();
			if (source == "STORAGE") this.auth.signOut();
			this.changedAccessToken = void 0;
		}
	}
};

//#endregion
//#region src/index.ts
/**
* Creates a new Supabase Client.
*
* @example
* ```ts
* import { createClient } from '@supabase/supabase-js'
*
* const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key')
* const { data, error } = await supabase.from('profiles').select('*')
* ```
*/
const createClient = (supabaseUrl, supabaseKey, options) => {
	return new SupabaseClient(supabaseUrl, supabaseKey, options);
};
function shouldShowDeprecationWarning() {
	if (typeof window !== "undefined") return false;
	const _process = globalThis["process"];
	if (!_process) return false;
	const processVersion = _process["version"];
	if (processVersion === void 0 || processVersion === null) return false;
	const versionMatch = processVersion.match(/^v(\d+)\./);
	if (!versionMatch) return false;
	return parseInt(versionMatch[1], 10) <= 18;
}
if (shouldShowDeprecationWarning()) console.warn("⚠️  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217");

const DB_NAME = "SmartDMDatabase";
const OPEN_TIMEOUT_MS = 5e3;
const QUERY_TIMEOUT_MS = 5e3;
function openCrmDb() {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("DB open timed out after " + OPEN_TIMEOUT_MS + "ms"));
    }, OPEN_TIMEOUT_MS);
    try {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = () => {
        clearTimeout(timer);
        resolve(request.result);
      };
      request.onerror = () => {
        clearTimeout(timer);
        reject(new Error("DB open error: " + (request.error?.message || "unknown")));
      };
      request.onblocked = () => {
        clearTimeout(timer);
        reject(new Error("DB open blocked (another tab upgrading)"));
      };
      request.onupgradeneeded = () => {
        clearTimeout(timer);
        try {
          request.transaction?.abort();
        } catch {
        }
        reject(new Error("DB does not exist yet (upgrade needed) — CRM must be opened first"));
      };
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}
function readAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Read ${storeName} timed out`));
    }, QUERY_TIMEOUT_MS);
    try {
      if (!db.objectStoreNames.contains(storeName)) {
        clearTimeout(timer);
        resolve([]);
        return;
      }
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => {
        clearTimeout(timer);
        resolve(request.result);
      };
      request.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Read ${storeName} error: ${request.error?.message}`));
      };
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}
function readByIndex(db, storeName, indexName, value) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`ReadByIndex ${storeName}.${indexName} timed out`));
    }, QUERY_TIMEOUT_MS);
    try {
      if (!db.objectStoreNames.contains(storeName)) {
        clearTimeout(timer);
        resolve([]);
        return;
      }
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      if (!store.indexNames.contains(indexName)) {
        clearTimeout(timer);
        resolve([]);
        return;
      }
      const index = store.index(indexName);
      const request = index.getAll(value);
      request.onsuccess = () => {
        clearTimeout(timer);
        resolve(request.result);
      };
      request.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`ReadByIndex ${storeName}.${indexName} error: ${request.error?.message}`));
      };
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}
function addToStore(db, storeName, record) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Add to ${storeName} timed out`));
    }, QUERY_TIMEOUT_MS);
    try {
      if (!db.objectStoreNames.contains(storeName)) {
        clearTimeout(timer);
        reject(new Error(`Store ${storeName} does not exist`));
        return;
      }
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const request = store.add(record);
      request.onsuccess = () => {
        clearTimeout(timer);
        resolve(request.result);
      };
      request.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Add to ${storeName} error: ${request.error?.message}`));
      };
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}
function putToStore(db, storeName, record) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Put to ${storeName} timed out`));
    }, QUERY_TIMEOUT_MS);
    try {
      if (!db.objectStoreNames.contains(storeName)) {
        clearTimeout(timer);
        reject(new Error(`Store ${storeName} does not exist`));
        return;
      }
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const request = store.put(record);
      request.onsuccess = () => {
        clearTimeout(timer);
        resolve(request.result);
      };
      request.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Put to ${storeName} error: ${request.error?.message}`));
      };
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}
function getFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Get from ${storeName} timed out`));
    }, QUERY_TIMEOUT_MS);
    try {
      if (!db.objectStoreNames.contains(storeName)) {
        clearTimeout(timer);
        resolve(void 0);
        return;
      }
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => {
        clearTimeout(timer);
        resolve(request.result || void 0);
      };
      request.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Get from ${storeName} error: ${request.error?.message}`));
      };
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}
async function findContactByPhone(phone) {
  const cleanPhone = phone.replace(/\D/g, "");
  const phoneSuffix = cleanPhone.slice(-9);
  if (!phoneSuffix || phoneSuffix.length < 9) return void 0;
  let db = null;
  try {
    db = await openCrmDb();
    const tx = db.transaction("contacts", "readonly");
    const store = tx.objectStore("contacts");
    if (store.indexNames.contains("phoneSuffix")) {
      const index = store.index("phoneSuffix");
      const result = await new Promise((resolve) => {
        const request = index.get(phoneSuffix);
        request.onsuccess = () => resolve(request.result || void 0);
        request.onerror = () => resolve(void 0);
      });
      return result;
    }
    const contacts = await readAllFromStore(db, "contacts");
    return contacts.find((c) => {
      if (!c.phoneNumber) return false;
      return c.phoneNumber.replace(/\D/g, "").slice(-9) === phoneSuffix;
    });
  } catch (err) {
    console.error("[crm-db] findContactByPhone error:", err);
    return void 0;
  } finally {
    db?.close();
  }
}
async function getContactById(id) {
  let db = null;
  try {
    db = await openCrmDb();
    const result = await new Promise((resolve, reject) => {
      const tx = db.transaction("contacts", "readonly");
      const req = tx.objectStore("contacts").get(id);
      req.onsuccess = () => resolve(req.result || void 0);
      req.onerror = () => reject(req.error);
    });
    return result;
  } catch {
    return void 0;
  } finally {
    db?.close();
  }
}
async function updateContactByPhone(phone, updates) {
  const contact = await findContactByPhone(phone);
  if (!contact || contact.id == null) return false;
  let db = null;
  try {
    db = await openCrmDb();
    const mergedCustomFields = updates.customFields != null ? { ...contact.customFields || {}, ...updates.customFields } : void 0;
    const { customFields: _cf, ...restUpdates } = updates;
    const updated = {
      ...contact,
      ...restUpdates,
      ...mergedCustomFields !== void 0 ? { customFields: mergedCustomFields } : {},
      updatedAt: /* @__PURE__ */ new Date()
    };
    await new Promise((resolve, reject) => {
      const tx = db.transaction("contacts", "readwrite");
      const req = tx.objectStore("contacts").put(updated);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return true;
  } catch (err) {
    console.error("[crm-db] updateContactByPhone error:", err);
    return false;
  } finally {
    db?.close();
  }
}
async function getContactFieldsConfig() {
  let db = null;
  try {
    db = await openCrmDb();
    const config = await getFromStore(db, "contactFieldsConfig", "contact-fields");
    return config ?? void 0;
  } finally {
    db?.close();
  }
}
async function addContactField(field) {
  let db = null;
  try {
    db = await openCrmDb();
    const config = await getFromStore(db, "contactFieldsConfig", "contact-fields");
    const fields = config?.fields ?? [];
    const fieldId = "field_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const name = (field.name || field.label).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "field";
    const newField = {
      id: fieldId,
      name,
      label: field.label || name,
      type: field.type || "string",
      required: field.required ?? false,
      options: field.options,
      order: fields.length
    };
    const updated = {
      id: "contact-fields",
      fields: [...fields, newField],
      updatedAt: /* @__PURE__ */ new Date()
    };
    await putToStore(db, "contactFieldsConfig", updated);
    return { success: true, fieldId };
  } catch (err) {
    return { success: false, error: String(err) };
  } finally {
    db?.close();
  }
}
async function getCustomSchemasList() {
  let db = null;
  try {
    db = await openCrmDb();
    const list = await readAllFromStore(db, "customSchemas");
    return list ?? [];
  } finally {
    db?.close();
  }
}
async function addCustomSchema(schema) {
  let db = null;
  try {
    db = await openCrmDb();
    const schemaId = "schema_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const fields = schema.fields.map((f, i) => ({
      id: "f_" + i + "_" + Math.random().toString(36).slice(2, 6),
      name: (f.name || f.label).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "field",
      label: f.label || f.name,
      type: f.type || "string",
      required: false,
      options: f.options,
      order: i
    }));
    const record = {
      id: schemaId,
      name: schema.name,
      label: schema.label,
      fields,
      createdAt: /* @__PURE__ */ new Date()
    };
    await putToStore(db, "customSchemas", record);
    return { success: true, schemaId };
  } catch (err) {
    return { success: false, error: String(err) };
  } finally {
    db?.close();
  }
}
async function addCustomRecord(params) {
  let db = null;
  try {
    db = await openCrmDb();
    const now = /* @__PURE__ */ new Date();
    const record = {
      schemaId: params.schemaId,
      contactId: params.contactId,
      data: params.data ?? {},
      createdAt: now,
      updatedAt: now
    };
    const id = await addToStore(db, "customRecords", record);
    return { success: true, recordId: id };
  } catch (err) {
    return { success: false, error: String(err) };
  } finally {
    db?.close();
  }
}
async function createContact(phone, name) {
  const phoneSuffix = phone.replace(/\D/g, "").slice(-9);
  let db = null;
  try {
    db = await openCrmDb();
    if (phoneSuffix.length === 9) {
      const existing = await new Promise((resolve) => {
        const tx = db.transaction("contacts", "readonly");
        const store = tx.objectStore("contacts");
        if (store.indexNames.contains("phoneSuffix")) {
          const req = store.index("phoneSuffix").get(phoneSuffix);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        } else {
          resolve(null);
        }
      });
      if (existing && existing.id) {
        console.log("[crm-db] Duplicate prevented, existing id:", existing.id);
        return existing.id;
      }
    }
    const now = /* @__PURE__ */ new Date();
    const contactId = await addToStore(db, "contacts", {
      phoneNumber: phone,
      phoneSuffix: phoneSuffix.length === 9 ? phoneSuffix : "",
      name: name || phone,
      status: "new_lead",
      tags: [],
      notes: "",
      createdAt: now,
      updatedAt: now
    });
    console.log("[crm-db] Contact created, id:", contactId);
    return contactId;
  } catch (err) {
    console.error("[crm-db] createContact error:", err);
    return null;
  } finally {
    db?.close();
  }
}
const EMPTY_RESULT = { contact: null, inCRM: false, messages: [], customRecords: [], campaigns: [], flowExecutions: [], contactFieldsConfig: [] };
async function getFullContactData(phone, name) {
  let db = null;
  try {
    db = await openCrmDb();
    console.log("[crm-db] DB opened, version:", db.version, "stores:", Array.from(db.objectStoreNames));
  } catch (err) {
    console.error("[crm-db] Cannot open DB:", err);
    return EMPTY_RESULT;
  }
  try {
    const phoneSuffix = phone ? phone.replace(/[\s\-\(\)\+]/g, "").slice(-9) : "";
    console.log("[crm-db] getFullContactData:", { phone, name, phoneSuffix });
    const allContacts = await readAllFromStore(db, "contacts");
    console.log("[crm-db] Total contacts:", allContacts.length);
    if (allContacts.length > 0 && allContacts.length <= 20) {
      console.log("[crm-db] All contacts:", allContacts.map((c) => ({ id: c.id, phone: c.phoneNumber, name: c.name })));
    }
    let contact;
    if (phoneSuffix) {
      contact = allContacts.find((c) => {
        if (!c.phoneNumber) return false;
        const cSuffix = c.phoneNumber.replace(/\D/g, "").slice(-9);
        return cSuffix === phoneSuffix;
      });
      console.log('[crm-db] Search by phone suffix "' + phoneSuffix + '":', contact ? `found #${contact.id} "${contact.name}"` : "not found");
    }
    if (!contact && name) {
      contact = allContacts.find((c) => c.name === name);
      if (!contact) {
        const nameLower = name.toLowerCase();
        contact = allContacts.find((c) => c.name?.toLowerCase() === nameLower);
      }
      if (!contact) {
        const nameLower = name.toLowerCase();
        contact = allContacts.find((c) => {
          const cName = c.name?.toLowerCase() || "";
          return cName.includes(nameLower) || nameLower.includes(cName);
        });
      }
      console.log('[crm-db] Search by name "' + name + '":', contact ? `found #${contact.id} "${contact.name}"` : "not found");
    }
    if (!contact || !contact.id) {
      db.close();
      return EMPTY_RESULT;
    }
    const [
      allMessages,
      allCustomRecords,
      allSchemas,
      allCampaigns,
      allFlowExecs,
      allFlows,
      allFieldsConfig
    ] = await Promise.all([
      readByIndex(db, "messages", "contactId", contact.id).catch(() => []),
      readByIndex(db, "customRecords", "contactId", contact.id).catch(() => []),
      readAllFromStore(db, "customSchemas").catch(() => []),
      readAllFromStore(db, "campaigns").catch(() => []),
      readByIndex(db, "flowExecutions", "contactId", contact.id).catch(() => []),
      readAllFromStore(db, "flows").catch(() => []),
      readAllFromStore(db, "contactFieldsConfig").catch(() => [])
    ]);
    db.close();
    const schemaMap = {};
    allSchemas.forEach((s) => {
      schemaMap[s.id] = s.label || s.name;
    });
    const recordsWithLabels = allCustomRecords.map((r) => ({
      id: r.id,
      schemaId: r.schemaId,
      schemaLabel: schemaMap[r.schemaId] || r.schemaId,
      data: r.data,
      createdAt: r.createdAt?.toISOString?.() || String(r.createdAt)
    }));
    const sortedMessages = allMessages.sort((a, b) => {
      const tA = a.timestamp instanceof Date ? a.timestamp.getTime() : Number(a.timestamp) || 0;
      const tB = b.timestamp instanceof Date ? b.timestamp.getTime() : Number(b.timestamp) || 0;
      return tB - tA;
    }).slice(0, 30);
    const messagesData = sortedMessages.map((m) => ({
      id: m.id,
      content: m.content,
      direction: m.direction,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : String(m.timestamp),
      isAIGenerated: m.isAIGenerated
    }));
    const contactCampaigns = allCampaigns.filter(
      (c) => c.recipients?.some((r) => {
        const rSuffix = r.phoneNumber?.replace(/\D/g, "").slice(-9);
        return rSuffix === phoneSuffix;
      })
    ).map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt)
    }));
    const flowMap = {};
    allFlows.forEach((f) => {
      flowMap[f.id] = f.name;
    });
    const sortedFlowExecs = allFlowExecs.sort((a, b) => {
      const tA = a.startedAt instanceof Date ? a.startedAt.getTime() : Number(a.startedAt) || 0;
      const tB = b.startedAt instanceof Date ? b.startedAt.getTime() : Number(b.startedAt) || 0;
      return tB - tA;
    }).slice(0, 10);
    const flowExecsData = sortedFlowExecs.map((fe) => ({
      id: fe.id,
      flowName: flowMap[fe.flowId] || fe.flowId,
      status: fe.status,
      startedAt: fe.startedAt instanceof Date ? fe.startedAt.toISOString() : String(fe.startedAt),
      completedAt: fe.completedAt instanceof Date ? fe.completedAt.toISOString() : String(fe.completedAt),
      log: fe.log?.slice(-5)
    }));
    const fields = allFieldsConfig[0]?.fields || [];
    console.log("[crm-db] ✅ Full data loaded for", contact.name, "— msgs:", messagesData.length, "records:", recordsWithLabels.length, "campaigns:", contactCampaigns.length, "flows:", flowExecsData.length);
    return {
      contact: {
        id: contact.id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        status: contact.status,
        tags: contact.tags,
        notes: contact.notes,
        customFields: contact.customFields,
        lastMessageDate: contact.lastMessageDate instanceof Date ? contact.lastMessageDate.toISOString() : String(contact.lastMessageDate || ""),
        createdAt: contact.createdAt instanceof Date ? contact.createdAt.toISOString() : String(contact.createdAt)
      },
      inCRM: true,
      customRecords: recordsWithLabels,
      messages: messagesData,
      campaigns: contactCampaigns,
      flowExecutions: flowExecsData,
      contactFieldsConfig: fields.map((f) => ({
        id: f.id,
        name: f.name,
        label: f.label,
        type: f.type,
        options: f.options
      }))
    };
  } catch (err) {
    console.error("[crm-db] getFullContactData error:", err);
    db?.close();
    return EMPTY_RESULT;
  }
}
async function getTemplates() {
  let db = null;
  try {
    db = await openCrmDb();
    const templates = await readAllFromStore(db, "templates");
    db.close();
    return templates.map((t) => ({
      id: t.id,
      title: t.title ?? t.name ?? "",
      content: t.content,
      category: t.category || "General",
      shortcut: t.shortcut || "",
      variables: t.variables || []
    }));
  } catch (err) {
    console.error("[crm-db] getTemplates error:", err);
    db?.close();
    return [];
  }
}
async function addTemplate(data) {
  let db = null;
  try {
    db = await openCrmDb();
    const now = /* @__PURE__ */ new Date();
    const title = data.title.trim();
    const id = await addToStore(db, "templates", {
      title,
      name: title,
      content: data.content.trim(),
      category: (data.category?.trim() || "General").toLowerCase(),
      shortcut: data.shortcut?.trim() || "",
      variables: [],
      createdAt: now
    });
    db.close();
    return id;
  } catch (err) {
    console.error("[crm-db] addTemplate error:", err);
    db?.close();
    return null;
  }
}
function toLocalDateIso$1(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getDateIsoInTimezone(date, timezone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(date);
}
function dateFromIso$1(dateIso) {
  return /* @__PURE__ */ new Date(`${dateIso}T00:00:00`);
}
function enumerateHolidayDates(startDate, endDate) {
  if (!startDate || !endDate) return [];
  if (startDate > endDate) return enumerateHolidayDates(endDate, startDate);
  const dates = [];
  let cursor = dateFromIso$1(startDate);
  const end = dateFromIso$1(endDate);
  while (cursor <= end) {
    dates.push(toLocalDateIso$1(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}
function getHolidayDates(settings) {
  if (Array.isArray(settings?.holidayRanges) && settings.holidayRanges.length > 0) {
    return Array.from(
      new Set(
        settings.holidayRanges.flatMap(
          (range) => enumerateHolidayDates(String(range?.startDate || ""), String(range?.endDate || range?.startDate || ""))
        )
      )
    ).sort();
  }
  return Array.isArray(settings?.holidays) ? settings.holidays : [];
}
function getHolidayReasonForDate(settings, dateIso) {
  if (!Array.isArray(settings?.holidayRanges)) return null;
  const holiday = settings.holidayRanges.find((range) => {
    const startDate = String(range?.startDate || "");
    const endDate = String(range?.endDate || range?.startDate || "");
    return startDate && endDate && dateIso >= startDate && dateIso <= endDate;
  });
  return holiday?.reason || holiday?.name || null;
}
function addDaysToIso(dateIso, days) {
  const date = /* @__PURE__ */ new Date(`${dateIso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toLocalDateIso$1(date);
}
function parseCalendarDateInput(dateStr, timezone) {
  const lower = String(dateStr || "").trim().toLowerCase();
  if (!lower) return null;
  if (lower === "today" || lower === "сегодня") {
    return dateFromIso$1(getDateIsoInTimezone(/* @__PURE__ */ new Date(), timezone));
  }
  if (lower === "tomorrow" || lower === "завтра") {
    return dateFromIso$1(addDaysToIso(getDateIsoInTimezone(/* @__PURE__ */ new Date(), timezone), 1));
  }
  const isoMatch = lower.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return dateFromIso$1(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`);
  }
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}
function parseCalendarTime(timeStr) {
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  if (/^\d{1}:\d{2}$/.test(timeStr)) return `0${timeStr}`;
  const match = String(timeStr || "").match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}
function formatDateForDisplay(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}
function formatTimeForDisplay(time) {
  return time;
}
function getNowPartsInTimezone$1(timezone) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(/* @__PURE__ */ new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value || "00";
  return {
    dateIso: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute"))
  };
}
function getDayOfWeekInTimezone(dateIso, timezone) {
  const date = /* @__PURE__ */ new Date(`${dateIso}T12:00:00`);
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short" });
  const dayName = formatter.format(date);
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[dayName] ?? 0;
}
function formatDateInTimezone(dateIso, timezone) {
  const date = dateFromIso$1(dateIso);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: timezone
  });
}
function getCalendarPromptHint(settings) {
  if (!settings) return null;
  const timezone = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const workingDays = Array.isArray(settings.workingDays) && settings.workingDays.length ? settings.workingDays : [1, 2, 3, 4, 5];
  const holidayDates = getHolidayDates(settings);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const workingDaysSummary = [...workingDays].sort((a, b) => a - b).map((d) => dayNames[d]).join(", ");
  const todayIso = getDateIsoInTimezone(/* @__PURE__ */ new Date(), timezone);
  const tomorrowIso = addDaysToIso(todayIso, 1);
  const tomorrowDay = getDayOfWeekInTimezone(tomorrowIso, timezone);
  const tomorrowIsWorking = workingDays.includes(tomorrowDay) && !holidayDates.includes(tomorrowIso);
  let nextWorkingDayLabel = "";
  let cursorIso = tomorrowIso;
  for (let i = 0; i < 14; i++) {
    const dayOfWeek = getDayOfWeekInTimezone(cursorIso, timezone);
    if (workingDays.includes(dayOfWeek) && !holidayDates.includes(cursorIso)) {
      nextWorkingDayLabel = formatDateInTimezone(cursorIso, timezone);
      break;
    }
    cursorIso = addDaysToIso(cursorIso, 1);
  }
  let holidayRangesSummary = "";
  if (Array.isArray(settings.holidayRanges) && settings.holidayRanges.length > 0) {
    holidayRangesSummary = settings.holidayRanges.map((range) => {
      const start = String(range?.startDate || "").trim();
      const end = String(range?.endDate || range?.startDate || "").trim();
      if (!start || !end) return null;
      const label = start === end ? formatDateInTimezone(start, timezone) : `${formatDateInTimezone(start, timezone)} – ${formatDateInTimezone(end, timezone)}`;
      const reason = range?.reason || range?.name || "Closed";
      return `${label}: ${reason}`;
    }).filter(Boolean).join("\n");
  }
  return {
    workingDaysSummary,
    todayLabel: formatDateInTimezone(todayIso, timezone),
    tomorrowLabel: formatDateInTimezone(tomorrowIso, timezone),
    tomorrowIsWorking,
    nextWorkingDayLabel,
    holidayRangesSummary
  };
}
function isPastSlotInTimezone(date, time, timezone) {
  const dateIso = toLocalDateIso$1(date);
  const now = getNowPartsInTimezone$1(timezone);
  if (dateIso < now.dateIso) return true;
  if (dateIso > now.dateIso) return false;
  const slotMinutes = timeToMinutes$1(time);
  const nowMinutes = now.hour * 60 + now.minute;
  return slotMinutes <= nowMinutes;
}
function isDateBeforeTodayInTimezone(date, timezone) {
  return toLocalDateIso$1(date) < getNowPartsInTimezone$1(timezone).dateIso;
}
async function getCalendarBookingsStore(db) {
  return readAllFromStore(db, "calendarBookings");
}
function buildAllSlotsForDate(date, settings) {
  const dateIso = toLocalDateIso$1(date);
  const dayOfWeek = date.getDay();
  if (!settings.workingDays?.includes(dayOfWeek)) {
    return { dateIso, allSlots: [] };
  }
  if (getHolidayDates(settings).includes(dateIso)) {
    return { dateIso, allSlots: [] };
  }
  const startMinutes = timeToMinutes$1(settings.workingHoursStart || "09:00");
  const endMinutes = timeToMinutes$1(settings.workingHoursEnd || "18:00");
  const duration = settings.slotDuration || 30;
  const buffer = settings.bufferBetweenSlots || 0;
  const breaks = settings.breakTimes || [];
  const allSlots = [];
  for (let minutes = startMinutes; minutes + duration <= endMinutes; minutes += duration + buffer) {
    const slotStart = minutesToTime(minutes);
    const slotEndMinutes = minutes + duration;
    const overlapsBreak = breaks.some((breakTime) => {
      const breakStart = timeToMinutes$1(breakTime.start);
      const breakEnd = timeToMinutes$1(breakTime.end);
      return minutes < breakEnd && slotEndMinutes > breakStart;
    });
    if (!overlapsBreak) {
      allSlots.push(slotStart);
    }
  }
  return { dateIso, allSlots };
}
async function buildAvailableSlotsForDate(db, date, settings) {
  const timezone = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { dateIso, allSlots } = buildAllSlotsForDate(date, settings);
  if (allSlots.length === 0) {
    return { dateIso, slots: [], allSlots: [], bookedTimes: [] };
  }
  const bookings = await getCalendarBookingsStore(db);
  const activeDayBookings = bookings.filter((booking) => {
    return toLocalDateIso$1(booking.date) === dateIso && booking.status !== "cancelled";
  });
  if (settings.maxBookingsPerDay && activeDayBookings.length >= settings.maxBookingsPerDay) {
    return { dateIso, slots: [], allSlots: [], bookedTimes: activeDayBookings.map((b) => b.startTime) };
  }
  const bookedTimes = activeDayBookings.map((booking) => booking.startTime);
  let slots = allSlots.filter((slot) => !bookedTimes.includes(slot));
  if (dateIso === getNowPartsInTimezone$1(timezone).dateIso) {
    slots = slots.filter((slot) => !isPastSlotInTimezone(date, slot, timezone));
  }
  return { dateIso, slots, allSlots, bookedTimes };
}
function normalizePhoneSuffix(phone) {
  return String(phone || "").replace(/\D/g, "").slice(-9);
}
function describeBookingResources(resources) {
  if (!Array.isArray(resources) || resources.length === 0) return "";
  return resources.map((resource) => `${resource.typeName}: ${resource.itemName}`).join(", ");
}
function sortCalendarBookings(bookings) {
  return [...bookings].sort((left, right) => {
    const leftKey = `${toLocalDateIso$1(left.date)} ${left.startTime || ""}`;
    const rightKey = `${toLocalDateIso$1(right.date)} ${right.startTime || ""}`;
    return leftKey.localeCompare(rightKey);
  });
}
function formatCalendarBookingLine(booking) {
  const dateLabel = toLocalDateIso$1(booking.date);
  const baseParts = [
    `${dateLabel} ${booking.startTime || "--:--"}-${booking.endTime || "--:--"}`,
    booking.contactName || "Unknown customer",
    booking.contactPhone || "no phone",
    booking.status || "unknown"
  ];
  const service = booking.service ? `service: ${booking.service}` : "";
  const resources = describeBookingResources(booking.resources);
  return [
    baseParts.join(" | "),
    service,
    resources ? `resources: ${resources}` : ""
  ].filter(Boolean).join(" | ");
}
function getCalendarResourceTypes(settings) {
  return Array.isArray(settings.resourceTypes) ? settings.resourceTypes : [];
}
function getCalendarResourceItems(settings) {
  return Array.isArray(settings.resourceItems) ? settings.resourceItems : [];
}
function resolveSelectedResources(settings, args) {
  const resources = [];
  const resourceTypes = getCalendarResourceTypes(settings);
  const resourceItems = getCalendarResourceItems(settings);
  for (const resourceType of resourceTypes) {
    const selectedItemId = args[resourceType.variable];
    if (!selectedItemId) continue;
    const item = resourceItems.find((resourceItem) => resourceItem.id === selectedItemId && resourceItem.typeId === resourceType.id);
    if (!item) continue;
    resources.push({
      typeId: resourceType.id,
      typeName: resourceType.name,
      itemId: item.id,
      itemName: item.name
    });
  }
  return resources;
}
async function getAvailableResourcesForSlotData(db, settings, date, time, service) {
  const dateIso = toLocalDateIso$1(date);
  const bookings = await getCalendarBookingsStore(db);
  const activeBookingsAtSlot = bookings.filter((booking) => {
    return toLocalDateIso$1(booking.date) === dateIso && booking.startTime === time && booking.status !== "cancelled";
  });
  const bookedItemIds = /* @__PURE__ */ new Set();
  for (const booking of activeBookingsAtSlot) {
    for (const resource of booking.resources || []) {
      bookedItemIds.add(resource.itemId);
    }
  }
  const resourcesByVariable = {};
  for (const resourceType of getCalendarResourceTypes(settings)) {
    const items = getCalendarResourceItems(settings).filter((item) => item.typeId === resourceType.id && item.isActive).filter((item) => !bookedItemIds.has(item.id)).filter((item) => !service || !Array.isArray(item.services) || item.services.length === 0 || item.services.includes(service));
    resourcesByVariable[resourceType.variable] = items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description
    }));
  }
  return resourcesByVariable;
}
async function handleCalendarCheckAvailability(args) {
  let db = null;
  try {
    const settings = await getCalendarSettings();
    if (!settings) {
      return { success: false, message: "Calendar settings are not available. Please open CRM first." };
    }
    const timezone = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = parseCalendarDateInput(args.date, timezone);
    if (!date) {
      return { success: false, message: 'Invalid date format. Please use YYYY-MM-DD or "today"/"tomorrow".' };
    }
    if (isDateBeforeTodayInTimezone(date, timezone)) {
      return {
        success: false,
        message: `Cannot check availability for a past date. Today in business timezone is ${getNowPartsInTimezone$1(timezone).dateIso}.`
      };
    }
    db = await openCrmDb();
    const availability = await buildAvailableSlotsForDate(db, date, settings);
    const displayDate = formatDateForDisplay(date);
    if (availability.slots.length === 0) {
      const holidayReason = getHolidayReasonForDate(settings, availability.dateIso);
      return {
        success: true,
        message: holidayReason ? `No available slots for ${displayDate} because we are closed for "${holidayReason}".` : `No available slots for ${displayDate}. This day may be a non-working day, holiday, break window, or fully booked.`,
        data: { date: availability.dateIso, slots: [], holidayReason: holidayReason || void 0 }
      };
    }
    return {
      success: true,
      message: `Available slots for ${displayDate}: ${availability.slots.map(formatTimeForDisplay).join(", ")}`,
      data: {
        date: availability.dateIso,
        slots: availability.slots.map((slot) => ({ time: slot, display: formatTimeForDisplay(slot) }))
      }
    };
  } catch (err) {
    console.error("[crm-db] handleCalendarCheckAvailability error:", err);
    return { success: false, message: "Error checking availability. Please try again." };
  } finally {
    db?.close();
  }
}
async function handleCalendarGetAvailableResources(args) {
  let db = null;
  try {
    const settings = await getCalendarSettings();
    if (!settings?.resourcesEnabled) {
      return { success: false, message: "Resources are not enabled for this calendar." };
    }
    const timezone = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = parseCalendarDateInput(args.date, timezone);
    const time = parseCalendarTime(args.time);
    if (!date || !time) {
      return { success: false, message: "Invalid date or time format." };
    }
    if (isDateBeforeTodayInTimezone(date, timezone)) {
      return {
        success: false,
        message: `Cannot check resources for a past date. Today in business timezone is ${getNowPartsInTimezone$1(timezone).dateIso}.`
      };
    }
    db = await openCrmDb();
    const availability = await buildAvailableSlotsForDate(db, date, settings);
    if (!availability.slots.includes(time)) {
      return {
        success: true,
        message: `The slot ${formatTimeForDisplay(time)} on ${formatDateForDisplay(date)} is not available.`,
        data: {}
      };
    }
    const resources = await getAvailableResourcesForSlotData(db, settings, date, time, args.service);
    const resourceTypes = getCalendarResourceTypes(settings);
    const lines = resourceTypes.map((resourceType) => {
      const items = resources[resourceType.variable] || [];
      return `${resourceType.name}: ${items.length ? items.map((item) => item.name).join(", ") : "None available"}`;
    });
    return {
      success: true,
      message: `Available resources for ${formatTimeForDisplay(time)} on ${formatDateForDisplay(date)}:
${lines.join("\n")}`,
      data: resources
    };
  } catch (err) {
    console.error("[crm-db] handleCalendarGetAvailableResources error:", err);
    return { success: false, message: "Error getting available resources." };
  } finally {
    db?.close();
  }
}
async function handleCalendarBookAppointment(args) {
  let db = null;
  try {
    const settings = await getCalendarSettings();
    if (!settings) {
      return { success: false, message: "Calendar settings are not available. Please open CRM first." };
    }
    const timezone = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = parseCalendarDateInput(args.date, timezone);
    const time = parseCalendarTime(args.time);
    if (!date || !time) {
      return { success: false, message: "Invalid date or time format." };
    }
    if (isDateBeforeTodayInTimezone(date, timezone)) {
      return {
        success: false,
        message: `Cannot book a past date. Today in business timezone is ${getNowPartsInTimezone$1(timezone).dateIso}.`
      };
    }
    if (isPastSlotInTimezone(date, time, timezone)) {
      return { success: false, message: "Cannot book a slot in the past." };
    }
    db = await openCrmDb();
    const availability = await buildAvailableSlotsForDate(db, date, settings);
    if (!availability.slots.includes(time)) {
      return {
        success: false,
        message: `The slot ${formatTimeForDisplay(time)} on ${formatDateForDisplay(date)} is not available.`
      };
    }
    const selectedResources = resolveSelectedResources(settings, args);
    for (const resourceType of getCalendarResourceTypes(settings)) {
      if (resourceType.required && !selectedResources.some((resource) => resource.typeId === resourceType.id)) {
        return { success: false, message: `${resourceType.name} selection is required for booking.` };
      }
    }
    if (settings.resourcesEnabled && selectedResources.length > 0) {
      const availableResources = await getAvailableResourcesForSlotData(db, settings, date, time, args.service);
      for (const resource of selectedResources) {
        const variable = getCalendarResourceTypes(settings).find((type) => type.id === resource.typeId)?.variable;
        const choices = variable ? availableResources[variable] || [] : [];
        if (!choices.some((choice) => choice.id === resource.itemId)) {
          return { success: false, message: `${resource.itemName} is not available at ${formatTimeForDisplay(time)}.` };
        }
      }
    }
    const startMinutes = timeToMinutes$1(time);
    const endTime = minutesToTime(startMinutes + (settings.slotDuration || 30));
    const now = /* @__PURE__ */ new Date();
    const bookingId = await addToStore(db, "calendarBookings", {
      contactPhone: args.customer_phone,
      contactName: args.customer_name,
      date,
      startTime: time,
      endTime,
      status: "pending",
      source: "ai",
      service: args.service,
      resources: selectedResources.length > 0 ? selectedResources : void 0,
      createdAt: now,
      updatedAt: now
    });
    const savedBooking = await getFromStore(db, "calendarBookings", bookingId);
    if (!savedBooking) {
      return {
        success: false,
        message: "Booking could not be verified after saving. Please try again."
      };
    }
    return {
      success: true,
      message: `Booking confirmed for ${args.customer_name} on ${formatDateForDisplay(date)} at ${formatTimeForDisplay(time)}.`,
      data: {
        bookingId,
        date: availability.dateIso,
        time,
        endTime,
        customerName: args.customer_name,
        customerPhone: args.customer_phone,
        service: args.service,
        resources: selectedResources
      }
    };
  } catch (err) {
    console.error("[crm-db] handleCalendarBookAppointment error:", err);
    return { success: false, message: "Error creating booking. Please try again." };
  } finally {
    db?.close();
  }
}
async function handleCalendarGetBookingInfo(args) {
  try {
    const bookings = await getContactBookings(args.customer_phone);
    if (!bookings.length) {
      return {
        success: true,
        message: `No bookings found for ${args.customer_phone}.`,
        data: { bookings: [] }
      };
    }
    const lines = bookings.slice(0, 5).map((booking) => {
      const date = new Date(booking.date);
      return `${formatDateForDisplay(date)} ${booking.startTime} (${booking.status})`;
    });
    return {
      success: true,
      message: `Bookings for ${args.customer_phone}:
${lines.join("\n")}`,
      data: { bookings }
    };
  } catch (err) {
    console.error("[crm-db] handleCalendarGetBookingInfo error:", err);
    return { success: false, message: "Error getting booking information." };
  }
}
async function handleCalendarListBookingsForDate(args) {
  let db = null;
  try {
    const settings = await getCalendarSettings();
    if (!settings) {
      return { success: false, message: "Calendar settings are not available. Please open CRM first." };
    }
    const timezone = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = parseCalendarDateInput(args.date, timezone);
    if (!date) {
      return { success: false, message: "Invalid date format." };
    }
    const dateIso = toLocalDateIso$1(date);
    db = await openCrmDb();
    const bookings = await getCalendarBookingsStore(db);
    const includeCancelled = !!args.include_cancelled;
    const dayBookings = sortCalendarBookings(
      bookings.filter((booking) => {
        if (toLocalDateIso$1(booking.date) !== dateIso) return false;
        if (!includeCancelled && booking.status === "cancelled") return false;
        return true;
      })
    );
    if (dayBookings.length === 0) {
      const holidayReason = getHolidayReasonForDate(settings, dateIso);
      return {
        success: true,
        message: holidayReason ? `No bookings found for ${formatDateForDisplay(date)}. The calendar is closed for "${holidayReason}".` : `No bookings found for ${formatDateForDisplay(date)}.`,
        data: { date: dateIso, bookings: [] }
      };
    }
    return {
      success: true,
      message: `Bookings for ${formatDateForDisplay(date)}:
${dayBookings.map(formatCalendarBookingLine).join("\n")}`,
      data: { date: dateIso, bookings: dayBookings }
    };
  } catch (err) {
    console.error("[crm-db] handleCalendarListBookingsForDate error:", err);
    return { success: false, message: "Error listing bookings for date." };
  } finally {
    db?.close();
  }
}
async function handleCalendarListBookingsForRange(args) {
  let db = null;
  try {
    const settings = await getCalendarSettings();
    if (!settings) {
      return { success: false, message: "Calendar settings are not available. Please open CRM first." };
    }
    const timezone = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const startDate = parseCalendarDateInput(args.start_date, timezone);
    const endDate = parseCalendarDateInput(args.end_date, timezone);
    if (!startDate || !endDate) {
      return { success: false, message: "Invalid start or end date format." };
    }
    const startIso = toLocalDateIso$1(startDate);
    const endIso = toLocalDateIso$1(endDate);
    const rangeStart = startIso <= endIso ? startIso : endIso;
    const rangeEnd = startIso <= endIso ? endIso : startIso;
    db = await openCrmDb();
    const bookings = await getCalendarBookingsStore(db);
    const includeCancelled = !!args.include_cancelled;
    const rangeBookings = sortCalendarBookings(
      bookings.filter((booking) => {
        const bookingDateIso = toLocalDateIso$1(booking.date);
        if (bookingDateIso < rangeStart || bookingDateIso > rangeEnd) return false;
        if (!includeCancelled && booking.status === "cancelled") return false;
        return true;
      })
    );
    if (rangeBookings.length === 0) {
      return {
        success: true,
        message: `No bookings found from ${rangeStart} to ${rangeEnd}.`,
        data: { startDate: rangeStart, endDate: rangeEnd, bookings: [] }
      };
    }
    return {
      success: true,
      message: `Bookings from ${rangeStart} to ${rangeEnd}:
${rangeBookings.map(formatCalendarBookingLine).join("\n")}`,
      data: { startDate: rangeStart, endDate: rangeEnd, bookings: rangeBookings }
    };
  } catch (err) {
    console.error("[crm-db] handleCalendarListBookingsForRange error:", err);
    return { success: false, message: "Error listing bookings for range." };
  } finally {
    db?.close();
  }
}
async function handleCalendarCancelBooking(args) {
  let db = null;
  try {
    const settings = await getCalendarSettings();
    if (!settings) {
      return { success: false, message: "Calendar settings are not available. Please open CRM first." };
    }
    const timezone = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = parseCalendarDateInput(args.date, timezone);
    const time = args.time ? parseCalendarTime(args.time) : void 0;
    if (!date) {
      return { success: false, message: "Invalid date format." };
    }
    const phoneSuffix = normalizePhoneSuffix(args.customer_phone);
    db = await openCrmDb();
    const bookings = await getCalendarBookingsStore(db);
    const dateIso = toLocalDateIso$1(date);
    const targetBooking = bookings.find((booking) => {
      if (booking.status === "cancelled") return false;
      if (toLocalDateIso$1(booking.date) !== dateIso) return false;
      if (normalizePhoneSuffix(booking.contactPhone) !== phoneSuffix) return false;
      if (time) return booking.startTime === time;
      return true;
    });
    if (!targetBooking) {
      return {
        success: false,
        message: `No booking found for ${args.customer_phone} on ${formatDateForDisplay(date)}${time ? ` at ${time}` : ""}.`
      };
    }
    await putToStore(db, "calendarBookings", {
      ...targetBooking,
      status: "cancelled",
      updatedAt: /* @__PURE__ */ new Date()
    });
    return {
      success: true,
      message: `Booking cancelled for ${formatDateForDisplay(date)}${targetBooking.startTime ? ` at ${targetBooking.startTime}` : ""}.`,
      data: { bookingId: targetBooking.id }
    };
  } catch (err) {
    console.error("[crm-db] handleCalendarCancelBooking error:", err);
    return { success: false, message: "Error cancelling booking." };
  } finally {
    db?.close();
  }
}
async function handleCalendarRescheduleBooking(args) {
  let db = null;
  try {
    const settings = await getCalendarSettings();
    if (!settings) {
      return { success: false, message: "Calendar settings are not available. Please open CRM first." };
    }
    const timezone = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const currentDate = parseCalendarDateInput(args.current_date, timezone);
    const currentTime = args.current_time ? parseCalendarTime(args.current_time) : void 0;
    const newDate = parseCalendarDateInput(args.new_date, timezone);
    const newTime = parseCalendarTime(args.new_time);
    if (!currentDate || !newDate || !newTime) {
      return { success: false, message: "Invalid current or new date/time format." };
    }
    if (isDateBeforeTodayInTimezone(newDate, timezone) || isPastSlotInTimezone(newDate, newTime, timezone)) {
      return { success: false, message: "Cannot move a booking to a past date or past time slot." };
    }
    const phoneSuffix = normalizePhoneSuffix(args.customer_phone);
    const currentDateIso = toLocalDateIso$1(currentDate);
    const newDateIso = toLocalDateIso$1(newDate);
    db = await openCrmDb();
    const bookings = await getCalendarBookingsStore(db);
    const targetBooking = bookings.find((booking) => {
      if (booking.status === "cancelled") return false;
      if (toLocalDateIso$1(booking.date) !== currentDateIso) return false;
      if (normalizePhoneSuffix(booking.contactPhone) !== phoneSuffix) return false;
      if (currentTime) return booking.startTime === currentTime;
      return true;
    });
    if (!targetBooking) {
      return {
        success: false,
        message: `No active booking found for ${args.customer_phone} on ${formatDateForDisplay(currentDate)}${currentTime ? ` at ${currentTime}` : ""}.`
      };
    }
    if (currentDateIso === newDateIso && targetBooking.startTime === newTime) {
      return {
        success: true,
        message: `This booking is already scheduled for ${formatDateForDisplay(newDate)} at ${formatTimeForDisplay(newTime)}.`,
        data: { bookingId: targetBooking.id }
      };
    }
    const ruleBasedAvailability = buildAllSlotsForDate(newDate, settings);
    if (!ruleBasedAvailability.allSlots.includes(newTime)) {
      return {
        success: false,
        message: `The slot ${formatTimeForDisplay(newTime)} on ${formatDateForDisplay(newDate)} is outside working hours, blocked by break time, holiday, or business rules.`
      };
    }
    const activeNewDayBookings = bookings.filter((booking) => {
      if (booking.id === targetBooking.id || booking.status === "cancelled") return false;
      return toLocalDateIso$1(booking.date) === newDateIso;
    });
    if (settings.maxBookingsPerDay && activeNewDayBookings.length >= settings.maxBookingsPerDay) {
      return {
        success: false,
        message: `Cannot move the booking to ${formatDateForDisplay(newDate)} because the maximum bookings limit for that day has already been reached.`
      };
    }
    const conflictingBooking = bookings.find((booking) => {
      if (booking.id === targetBooking.id || booking.status === "cancelled") return false;
      return toLocalDateIso$1(booking.date) === newDateIso && booking.startTime === newTime;
    });
    if (conflictingBooking) {
      return {
        success: false,
        message: `The slot ${formatTimeForDisplay(newTime)} on ${formatDateForDisplay(newDate)} is already occupied.`
      };
    }
    const targetResourceIds = new Set(
      Array.isArray(targetBooking.resources) ? targetBooking.resources.map((resource) => resource.itemId).filter(Boolean) : []
    );
    if (targetResourceIds.size > 0) {
      const resourceConflict = bookings.find((booking) => {
        if (booking.id === targetBooking.id || booking.status === "cancelled") return false;
        if (toLocalDateIso$1(booking.date) !== newDateIso || booking.startTime !== newTime) return false;
        return Array.isArray(booking.resources) && booking.resources.some((resource) => targetResourceIds.has(resource.itemId));
      });
      if (resourceConflict) {
        return {
          success: false,
          message: `The current assigned resource is not available at ${formatTimeForDisplay(newTime)} on ${formatDateForDisplay(newDate)}.`
        };
      }
    }
    const updatedBooking = {
      ...targetBooking,
      date: newDate,
      startTime: newTime,
      endTime: minutesToTime(timeToMinutes$1(newTime) + (settings.slotDuration || 30)),
      updatedAt: /* @__PURE__ */ new Date()
    };
    await putToStore(db, "calendarBookings", updatedBooking);
    return {
      success: true,
      message: `Booking moved for ${targetBooking.contactName} from ${formatDateForDisplay(currentDate)} ${targetBooking.startTime} to ${formatDateForDisplay(newDate)} ${formatTimeForDisplay(newTime)}.`,
      data: {
        bookingId: targetBooking.id,
        customerName: targetBooking.contactName,
        customerPhone: targetBooking.contactPhone,
        oldDate: currentDateIso,
        oldTime: targetBooking.startTime,
        newDate: newDateIso,
        newTime
      }
    };
  } catch (err) {
    console.error("[crm-db] handleCalendarRescheduleBooking error:", err);
    return { success: false, message: "Error rescheduling booking." };
  } finally {
    db?.close();
  }
}
async function handleCalendarChangeBookingResource(args) {
  let db = null;
  try {
    const settings = await getCalendarSettings();
    if (!settings) {
      return { success: false, message: "Calendar settings are not available. Please open CRM first." };
    }
    if (!settings.resourcesEnabled || !getCalendarResourceTypes(settings).length) {
      return { success: false, message: "Resources are not enabled for this calendar." };
    }
    const timezone = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = parseCalendarDateInput(args.date, timezone);
    const time = args.time ? parseCalendarTime(args.time) : void 0;
    if (!date) {
      return { success: false, message: "Invalid date format." };
    }
    const argVar = (args.resource_type_variable || "").trim().toLowerCase();
    const norm = (s) => (s || "").toLowerCase().trim().replace(/\s+/g, " ");
    let resourceType = getCalendarResourceTypes(settings).find(
      (t) => (t.variable || "").toLowerCase() === argVar
    );
    if (!resourceType && argVar) {
      resourceType = getCalendarResourceTypes(settings).find(
        (t) => norm(t.name) === norm(argVar)
      );
    }
    if (!resourceType) {
      return {
        success: false,
        message: `Unknown resource type "${args.resource_type_variable}". Use the variable from get_available_resources response keys, or the resource type name (e.g. Satış departamenti).`
      };
    }
    const resourceItems = getCalendarResourceItems(settings);
    const newItem = resourceItems.find(
      (item) => item.id === args.new_resource_item_id && item.typeId === resourceType.id && item.isActive
    );
    if (!newItem) {
      return {
        success: false,
        message: `Resource item "${args.new_resource_item_id}" not found or not active for type ${resourceType.name}. Use get_available_resources for that slot to get valid item ids.`
      };
    }
    const phoneSuffix = normalizePhoneSuffix(args.customer_phone);
    const dateIso = toLocalDateIso$1(date);
    db = await openCrmDb();
    const bookings = await getCalendarBookingsStore(db);
    const targetBooking = bookings.find((booking) => {
      if (booking.status === "cancelled") return false;
      if (toLocalDateIso$1(booking.date) !== dateIso) return false;
      if (normalizePhoneSuffix(booking.contactPhone) !== phoneSuffix) return false;
      if (time) return booking.startTime === time;
      return true;
    });
    if (!targetBooking) {
      return {
        success: false,
        message: `No active booking found for ${args.customer_phone} on ${formatDateForDisplay(date)}${time ? ` at ${time}` : ""}.`
      };
    }
    const currentResources = Array.isArray(targetBooking.resources) ? targetBooking.resources : [];
    const otherTypeResources = currentResources.filter((r) => r.typeId !== resourceType.id);
    const currentOfType = currentResources.find((r) => r.typeId === resourceType.id);
    if (!currentOfType) {
      return {
        success: false,
        message: `This booking does not have a ${resourceType.name} assigned. Cannot change.`
      };
    }
    if (currentOfType.itemId === args.new_resource_item_id) {
      return {
        success: true,
        message: `Booking already has ${newItem.name} (${resourceType.name}) assigned.`,
        data: { bookingId: targetBooking.id }
      };
    }
    const alreadyBookedAtSlot = bookings.some((booking) => {
      if (booking.id === targetBooking.id || booking.status === "cancelled") return false;
      if (toLocalDateIso$1(booking.date) !== dateIso || booking.startTime !== (targetBooking.startTime || time)) return false;
      return Array.isArray(booking.resources) && booking.resources.some((r) => r.itemId === args.new_resource_item_id);
    });
    if (alreadyBookedAtSlot) {
      return {
        success: false,
        message: `${newItem.name} is already assigned to another booking at ${formatTimeForDisplay(targetBooking.startTime)} on ${formatDateForDisplay(date)}.`
      };
    }
    const newResourceEntry = {
      typeId: resourceType.id,
      typeName: resourceType.name,
      itemId: newItem.id,
      itemName: newItem.name
    };
    const updatedResources = [...otherTypeResources, newResourceEntry];
    const updatedBooking = {
      ...targetBooking,
      resources: updatedResources,
      updatedAt: /* @__PURE__ */ new Date()
    };
    await putToStore(db, "calendarBookings", updatedBooking);
    return {
      success: true,
      message: `Booking updated: ${resourceType.name} changed from ${currentOfType.itemName} to ${newItem.name} for ${formatDateForDisplay(date)} at ${formatTimeForDisplay(targetBooking.startTime)}.`,
      data: { bookingId: targetBooking.id, resources: updatedResources }
    };
  } catch (err) {
    console.error("[crm-db] handleCalendarChangeBookingResource error:", err);
    return { success: false, message: "Error changing booking resource." };
  } finally {
    db?.close();
  }
}
async function executeCalendarTool(toolName, args) {
  switch (toolName) {
    case "check_availability":
      return handleCalendarCheckAvailability(args);
    case "book_appointment":
      return handleCalendarBookAppointment(args);
    case "get_available_resources":
      return handleCalendarGetAvailableResources(args);
    case "cancel_booking":
      return handleCalendarCancelBooking(args);
    case "get_booking_info":
      return handleCalendarGetBookingInfo(args);
    case "list_bookings_for_date":
      return handleCalendarListBookingsForDate(args);
    case "list_bookings_for_range":
      return handleCalendarListBookingsForRange(args);
    case "reschedule_booking":
      return handleCalendarRescheduleBooking(args);
    case "change_booking_resource":
      return handleCalendarChangeBookingResource(args);
    default:
      return { success: false, message: `Unknown calendar tool: ${toolName}` };
  }
}
async function getContactBookings(contactPhone) {
  let db = null;
  try {
    db = await openCrmDb();
    const phoneSuffix = contactPhone.replace(/[\s\-\(\)\+]/g, "").slice(-9);
    const allBookings = await readAllFromStore(db, "calendarBookings");
    db.close();
    return allBookings.filter((b) => {
      const bSuffix = (b.contactPhone || "").replace(/\D/g, "").slice(-9);
      return bSuffix === phoneSuffix;
    }).map((b) => ({
      id: b.id,
      date: b.date instanceof Date ? b.date.toISOString() : String(b.date),
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
      notes: b.notes || "",
      source: b.source,
      contactName: b.contactName
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error("[crm-db] getContactBookings error:", err);
    db?.close();
    return [];
  }
}
async function getCalendarSettings() {
  let db = null;
  try {
    db = await openCrmDb();
    if (!db.objectStoreNames.contains("calendarSettings")) {
      db.close();
      return null;
    }
    const tx = db.transaction("calendarSettings", "readonly");
    const store = tx.objectStore("calendarSettings");
    const result = await new Promise((resolve, reject) => {
      const req = store.get("calendar-settings");
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch (err) {
    console.error("[crm-db] getCalendarSettings error:", err);
    db?.close();
    return null;
  }
}
async function getAvailableSlots(dateStr) {
  try {
    const settings = await getCalendarSettings();
    if (!settings) return [];
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    if (!settings.workingDays?.includes(dayOfWeek)) return [];
    const dateISO = date.toISOString().split("T")[0];
    if (getHolidayDates(settings).includes(dateISO)) return [];
    const startMinutes = timeToMinutes$1(settings.workingHoursStart || "09:00");
    const endMinutes = timeToMinutes$1(settings.workingHoursEnd || "18:00");
    const duration = settings.slotDuration || 30;
    const buffer = settings.bufferBetweenSlots || 0;
    const breaks = settings.breakTimes || [];
    const slots = [];
    for (let m = startMinutes; m + duration <= endMinutes; m += duration + buffer) {
      const slotStart = minutesToTime(m);
      const slotEnd = minutesToTime(m + duration);
      const inBreak = breaks.some((br) => {
        const brStart = timeToMinutes$1(br.start);
        const brEnd = timeToMinutes$1(br.end);
        return m < brEnd && m + duration > brStart;
      });
      if (!inBreak) slots.push(slotStart);
    }
    let db = null;
    try {
      db = await openCrmDb();
      const allBookings = await readAllFromStore(db, "calendarBookings");
      db.close();
      const bookedTimes = allBookings.filter((b) => {
        const bDate = b.date instanceof Date ? b.date.toISOString().split("T")[0] : String(b.date).split("T")[0];
        return bDate === dateISO && b.status !== "cancelled";
      }).map((b) => b.startTime);
      return slots.filter((s) => !bookedTimes.includes(s));
    } catch {
      return slots;
    }
  } catch (err) {
    console.error("[crm-db] getAvailableSlots error:", err);
    return [];
  }
}
function timeToMinutes$1(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
async function createQuickBooking(data) {
  let db = null;
  try {
    db = await openCrmDb();
    const now = /* @__PURE__ */ new Date();
    const id = await addToStore(db, "calendarBookings", {
      contactPhone: data.contactPhone,
      contactName: data.contactName,
      date: new Date(data.date),
      startTime: data.startTime,
      endTime: data.endTime,
      status: "confirmed",
      source: "manual",
      createdAt: now,
      updatedAt: now
    });
    db.close();
    return id;
  } catch (err) {
    console.error("[crm-db] createQuickBooking error:", err);
    db?.close();
    return null;
  }
}
async function getActiveFlows() {
  let db = null;
  try {
    db = await openCrmDb();
    const allFlows = await readAllFromStore(db, "flows");
    db.close();
    return allFlows.filter((f) => f.isActive).map((f) => ({ id: f.id, name: f.name, description: f.description || "" }));
  } catch (err) {
    console.error("[crm-db] getActiveFlows error:", err);
    db?.close();
    return [];
  }
}
async function createFlowExecution(flowId, contactId, contactName) {
  let db = null;
  try {
    db = await openCrmDb();
    const now = /* @__PURE__ */ new Date();
    const id = await addToStore(db, "flowExecutions", {
      flowId,
      contactId,
      contactName,
      status: "pending",
      currentStepIndex: 0,
      startedAt: now,
      log: []
    });
    db.close();
    return id;
  } catch (err) {
    console.error("[crm-db] createFlowExecution error:", err);
    db?.close();
    return null;
  }
}
async function createFlow(params) {
  const {
    name,
    messageTemplate,
    description = "",
    goal = "",
    triggerType = "event",
    triggerEventType = "contact_added",
    moduleId,
    moduleEventId,
    waitBeforeMessage,
    isActive = true
  } = params;
  if (!name || !messageTemplate) {
    return { error: "name and messageTemplate are required" };
  }
  if (triggerType === "module_event" && (!moduleId || !moduleEventId)) {
    return { error: "module_event trigger requires moduleId and moduleEventId" };
  }
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const now = /* @__PURE__ */ new Date();
  const trigger = triggerType === "module_event" && moduleId && moduleEventId ? { type: "module_event", moduleId, moduleEventId } : { type: "event", eventType: triggerEventType };
  const steps = [];
  if (waitBeforeMessage && waitBeforeMessage.duration > 0) {
    steps.push({
      id: "step_wait",
      type: "wait",
      waitDuration: waitBeforeMessage.duration,
      waitUnit: waitBeforeMessage.unit
    });
  }
  steps.push({
    id: steps.length ? "step_message" : "step1",
    type: "send_message",
    messageTemplate: String(messageTemplate).trim()
  });
  const flow = {
    id,
    name: String(name).trim(),
    description: String(description).trim(),
    goal: String(goal).trim(),
    isActive: !!isActive,
    enabled: !!isActive,
    trigger,
    steps,
    createdAt: now,
    updatedAt: now,
    stats: { totalRuns: 0, successfulRuns: 0, failedRuns: 0 }
  };
  let db = null;
  try {
    db = await openCrmDb();
    await putToStore(db, "flows", flow);
    db.close();
    return { id };
  } catch (err) {
    console.error("[crm-db] createFlow error:", err);
    db?.close();
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
async function getAccountOwnerContact() {
  let db = null;
  try {
    db = await openCrmDb();
    const storeNames = Array.from(db.objectStoreNames);
    if (!storeNames.includes("accountSettings")) {
      db.close();
      return null;
    }
    const allSettings = await readAllFromStore(db, "accountSettings");
    const settings = allSettings.find((s) => s.id === "account-settings");
    if (!settings?.ownerContactId) {
      db.close();
      return null;
    }
    const ownerContactId = settings.ownerContactId;
    const allContacts = await readAllFromStore(db, "contacts");
    db.close();
    const contact = allContacts.find((c) => c.id === ownerContactId);
    if (!contact) return null;
    return { ownerContactId, ownerPhone: contact.phoneNumber, ownerName: contact.name };
  } catch (err) {
    console.error("[crm-db] getAccountOwnerContact error:", err);
    db?.close();
    return null;
  }
}
async function createCampaign(params) {
  const { name, messageTemplate, campaignGoal, recipientPhones = [], recipientNames = [] } = params;
  const phones = /* @__PURE__ */ new Set();
  for (const p of recipientPhones) {
    const normalized = p.replace(/\D/g, "").trim();
    if (normalized.length >= 9) phones.add(normalized.slice(-9));
  }
  const owner = await getAccountOwnerContact();
  let db = null;
  try {
    db = await openCrmDb();
    const contacts = await readAllFromStore(db, "contacts");
    for (const n of recipientNames) {
      const nameNorm = (n || "").trim().toLowerCase();
      if (nameNorm === "myself" && owner?.ownerPhone) {
        const suffix = owner.ownerPhone.replace(/\D/g, "").slice(-9);
        if (suffix.length >= 9) phones.add(suffix);
        continue;
      }
      const contact = contacts.find(
        (c) => c.name && c.name.trim().toLowerCase().includes(nameNorm) || c.phoneNumber && c.phoneNumber.replace(/\D/g, "").slice(-9) === nameNorm.replace(/\D/g, "").slice(-9)
      );
      if (contact?.phoneNumber) {
        const suffix = contact.phoneNumber.replace(/\D/g, "").slice(-9);
        if (suffix.length >= 9) phones.add(suffix);
      }
    }
    const recipientList = [];
    for (const suffix of phones) {
      const contact = contacts.find((c) => c.phoneNumber && c.phoneNumber.replace(/\D/g, "").slice(-9) === suffix);
      const phoneNumber = contact?.phoneNumber || (suffix.length === 9 ? `+994${suffix}` : suffix);
      recipientList.push({
        phoneNumber,
        name: contact?.name || void 0,
        status: "pending",
        variables: { name: contact?.name || phoneNumber }
      });
    }
    const now = /* @__PURE__ */ new Date();
    const campaign = {
      name,
      status: "draft",
      messageTemplate,
      recipients: recipientList,
      settings: {
        minDelay: 2e3,
        maxDelay: 6e3,
        pauseAfterMessages: 0,
        pauseDuration: 0,
        stopOnError: false,
        skipExisting: false,
        gptSystemMessage: campaignGoal || void 0
      },
      campaignGoal: campaignGoal || void 0,
      stats: { total: recipientList.length, sent: 0, failed: 0, pending: recipientList.length },
      createdAt: now,
      updatedAt: now,
      workspaceId: "default"
    };
    const id = await addToStore(db, "campaigns", campaign);
    db.close();
    return { id };
  } catch (err) {
    console.error("[crm-db] createCampaign error:", err);
    db?.close();
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
async function startCampaignByIdOrName(params) {
  const { id, name } = params;
  let db = null;
  try {
    db = await openCrmDb();
    const campaigns = await readAllFromStore(db, "campaigns");
    let campaign = id != null ? campaigns.find((c) => Number(c.id) === Number(id)) : null;
    if (!campaign && name != null && String(name).trim()) {
      const nameNorm = String(name).trim().toLowerCase();
      campaign = campaigns.find((c) => c.name && String(c.name).trim().toLowerCase() === nameNorm && (c.status === "draft" || c.status === "scheduled"));
      if (!campaign) campaign = campaigns.find((c) => c.name && String(c.name).trim().toLowerCase().includes(nameNorm) && (c.status === "draft" || c.status === "scheduled"));
    }
    if (!campaign) {
      db.close();
      return { error: id != null ? "Campaign not found" : "No draft campaign found with that name" };
    }
    const now = /* @__PURE__ */ new Date();
    const updated = {
      ...campaign,
      status: "running",
      startedAt: now,
      updatedAt: now,
      stats: campaign.stats ? { ...campaign.stats } : { total: 0, sent: 0, failed: 0, pending: 0 }
    };
    await putToStore(db, "campaigns", updated);
    db.close();
    return { campaign: updated };
  } catch (err) {
    console.error("[crm-db] startCampaignByIdOrName error:", err);
    db?.close();
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
async function updateCampaignRecipientStatus(campaignId, phoneNumber, status, errorMessage) {
  let db = null;
  try {
    db = await openCrmDb();
    const campaigns = await readAllFromStore(db, "campaigns");
    const campaign = campaigns.find((c) => Number(c.id) === Number(campaignId));
    if (!campaign || !campaign.recipients) return;
    const suffix = phoneNumber.replace(/\D/g, "").slice(-9);
    const recipients = campaign.recipients.map((r) => {
      const rSuffix = (r.phoneNumber || "").replace(/\D/g, "").slice(-9);
      if (rSuffix !== suffix) return r;
      return { ...r, status, sentAt: status === "sent" ? /* @__PURE__ */ new Date() : void 0, errorMessage: status === "failed" ? errorMessage : void 0 };
    });
    const sent = recipients.filter((r) => r.status === "sent").length;
    const failed = recipients.filter((r) => r.status === "failed").length;
    const pending = recipients.filter((r) => r.status === "pending").length;
    await putToStore(db, "campaigns", { ...campaign, recipients, updatedAt: /* @__PURE__ */ new Date(), stats: { total: recipients.length, sent, failed, pending } });
  } finally {
    db?.close();
  }
}
async function getCampaignById(campaignId) {
  let db = null;
  try {
    db = await openCrmDb();
    const campaigns = await readAllFromStore(db, "campaigns");
    const campaign = campaigns.find((c) => Number(c.id) === Number(campaignId));
    return campaign ? { name: campaign.name || "Campaign", stats: campaign.stats } : null;
  } catch (err) {
    console.error("[crm-db] getCampaignById error:", err);
    return null;
  } finally {
    db?.close();
  }
}
async function getAIAgents() {
  let db = null;
  try {
    db = await openCrmDb();
    const agents = await readAllFromStore(db, "aiAgents");
    db.close();
    return agents.filter((a) => a.isActive).map((a) => ({
      id: a.id,
      agentId: a.agentId,
      name: a.name,
      description: a.description || "",
      icon: a.icon || "Bot",
      isDefault: a.isDefault
    }));
  } catch (err) {
    console.error("[crm-db] getAIAgents error:", err);
    db?.close();
    return [];
  }
}

function notifyCrmContactChanged() {
  chrome.runtime.sendMessage({ type: "CRM_CONTACTS_CHANGED" }).catch(() => {
  });
}
function notifyCalendarBookingsChanged() {
  chrome.runtime.sendMessage({ type: "CALENDAR_BOOKINGS_CHANGED" }).catch(() => {
  });
}
const APP_NOTIFICATION_FEED_KEY = "appNotificationFeed";
const APP_FEED_MAX = 50;
async function pushToAppNotificationFeed(type, title, message) {
  try {
    const result = await chrome.storage.local.get([APP_NOTIFICATION_FEED_KEY]);
    const feed = result[APP_NOTIFICATION_FEED_KEY] || [];
    const id = `${type}-${Date.now()}`;
    const next = [...feed, { id, type, title, message, timestamp: Date.now() }].slice(-APP_FEED_MAX);
    await chrome.storage.local.set({ [APP_NOTIFICATION_FEED_KEY]: next });
  } catch (e) {
    console.warn("[Background] pushToAppNotificationFeed failed:", e);
  }
}
function normalizeDateValue(v) {
  if (typeof v !== "string") return v;
  const ddmmyyyy = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
  const ddmmyyyyHhmm = /^(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$/;
  let m = v.trim().match(ddmmyyyyHhmm);
  if (m) {
    const [, d, mo, y, h, min, sec = "00"] = m;
    const pad = (x) => x.padStart(2, "0");
    return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(min)}:${pad(sec)}`;
  }
  m = v.trim().match(ddmmyyyy);
  if (m) {
    const [, d, mo, y] = m;
    const pad = (x) => x.padStart(2, "0");
    return `${y}-${pad(mo)}-${pad(d)}`;
  }
  return v;
}
function normalizeObjectDates(obj) {
  const out = {};
  for (const [k, val] of Object.entries(obj)) {
    out[k] = normalizeDateValue(val);
  }
  return out;
}
const createContactPendingKeys = /* @__PURE__ */ new Set();
const createContactPending = /* @__PURE__ */ new Map();
const createContactPendingResolve = /* @__PURE__ */ new Map();
const pendingInventoryResults = /* @__PURE__ */ new Map();
const SUPABASE_URL = "https://aomylguqhxsegcxvbpmo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbXlsZ3VxaHhzZWdjeHZicG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MTMwNjYsImV4cCI6MjA4NDk4OTA2Nn0.6g4JirBl7dwgphf4o8XjYw66QHPue1rFXGnWp7TiIjM";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let realtimeChannel = null;
let currentSubscribedWorkspaceId = null;
async function updateRealtimeUsageFromDB(row) {
  const storageData = await chrome.storage.local.get(["workspace"]);
  const plan = storageData.workspace?.plan;
  const realtimeUsage = {
    messagesSent: row.messages_sent || 0,
    aiReplies: row.ai_replies || 0,
    campaignsCreated: row.campaigns_created || 0,
    date: row.date,
    messagesLimit: plan?.messagesPerDay || 0,
    aiRepliesLimit: plan?.aiRepliesPerDay || 0,
    timestamp: Date.now()
  };
  await chrome.storage.local.set({ realtimeUsage });
  console.log("[Background] 📡 realtimeUsage updated:", realtimeUsage.messagesSent, "msgs,", realtimeUsage.aiReplies, "AI");
}
function subscribeToUsageCounters(workspaceId) {
  if (currentSubscribedWorkspaceId === workspaceId && realtimeChannel) return;
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
    currentSubscribedWorkspaceId = null;
  }
  console.log("[Background] 📡 Subscribing to Realtime for workspace:", workspaceId);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  realtimeChannel = supabase.channel(`usage_${workspaceId}`).on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "usage_counters",
      filter: `workspace_id=eq.${workspaceId}`
    },
    (payload) => {
      const row = payload.new;
      if (row && row.date === today) {
        console.log("[Background] 📡 Realtime usage update:", row);
        updateRealtimeUsageFromDB(row);
      }
    }
  ).subscribe((status) => {
    console.log("[Background] 📡 Realtime subscription status:", status);
  });
  currentSubscribedWorkspaceId = workspaceId;
}
let _bgRefreshPromise = null;
async function getValidToken() {
  const storageData = await chrome.storage.local.get(["accessToken", "refreshToken"]);
  const token = storageData.accessToken;
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1e3;
    const buffer = 60 * 1e3;
    if (Date.now() < exp - buffer) {
      return token;
    }
  } catch {
  }
  if (_bgRefreshPromise) return _bgRefreshPromise;
  _bgRefreshPromise = (async () => {
    const refreshToken = storageData.refreshToken;
    if (!refreshToken) {
      console.log("[Background] ❌ No refresh token, user must re-login");
      return null;
    }
    try {
      console.log("[Background] 🔄 Refreshing access token...");
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken })
      });
      if (!response.ok) {
        console.log("[Background] ❌ Refresh failed:", response.status);
        return null;
      }
      const data = await response.json();
      const newAccessToken = data.tokens?.accessToken;
      const newRefreshToken = data.tokens?.refreshToken;
      if (!newAccessToken) return null;
      const updates = { accessToken: newAccessToken };
      if (newRefreshToken) updates.refreshToken = newRefreshToken;
      await chrome.storage.local.set(updates);
      console.log("[Background] ✅ Token refreshed");
      return newAccessToken;
    } catch (error) {
      console.error("[Background] ❌ Refresh error:", error);
      return null;
    }
  })();
  try {
    return await _bgRefreshPromise;
  } finally {
    _bgRefreshPromise = null;
  }
}
async function fetchAndCacheUsage() {
  try {
    const storageData = await chrome.storage.local.get(["accessToken", "workspace"]);
    const token = await getValidToken();
    if (!token) return;
    const response = await fetch(`${API_BASE_URL}/usage/today`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) return;
    const data = await response.json();
    const plan = storageData.workspace?.plan;
    const realtimeUsage = {
      messagesSent: data.messagesSent || 0,
      aiReplies: data.aiReplies || 0,
      campaignsCreated: 0,
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      messagesLimit: data.dailyLimit || plan?.messagesPerDay || 0,
      aiRepliesLimit: data.aiRepliesLimit || plan?.aiRepliesPerDay || 0,
      timestamp: Date.now()
    };
    await chrome.storage.local.set({ realtimeUsage });
    console.log("[Background] 📊 Fetched usage from API:", realtimeUsage.messagesSent, "msgs,", realtimeUsage.aiReplies, "AI");
    const workspaceId = storageData.workspace?.id;
    if (workspaceId) {
      subscribeToUsageCounters(workspaceId);
    }
  } catch (error) {
    console.error("[Background] ❌ Failed to fetch usage:", error);
  }
}
async function refreshWorkspaceFromBackend() {
  try {
    const token = await getValidToken();
    if (!token) return;
    const response = await fetch(`${API_BASE_URL}/workspace/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!response.ok) return;
    const workspace = await response.json();
    await chrome.storage.local.set({ workspace });
    console.log("[Background] ✅ Workspace refreshed, plan:", workspace?.plan?.name);
  } catch (e) {
    console.warn("[Background] ⚠️ Failed to refresh workspace:", e);
  }
}
(async () => {
  try {
    await refreshWorkspaceFromBackend();
    const storageData = await chrome.storage.local.get(["workspace"]);
    const workspaceId = storageData.workspace?.id;
    if (workspaceId) {
      subscribeToUsageCounters(workspaceId);
      fetchAndCacheUsage();
    }
  } catch (e) {
    console.warn("[Background] Could not init Realtime on startup:", e);
  }
})();
setInterval(() => {
  refreshWorkspaceFromBackend().catch(() => {
  });
}, 10 * 60 * 1e3);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.workspace) {
    const newWorkspace = changes.workspace.newValue;
    if (newWorkspace?.id) {
      subscribeToUsageCounters(newWorkspace.id);
      fetchAndCacheUsage();
      flushPendingSyncs();
    }
  }
});
function parseVersion(v) {
  return v.replace(/^v/, "").split(".").map((n) => parseInt(n, 10) || 0);
}
function isVersionLessThan(current, latest) {
  const a = parseVersion(current);
  const b = parseVersion(latest);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x < y) return true;
    if (x > y) return false;
  }
  return false;
}
const EXTENSION_UPDATE_STORAGE_KEY = "extensionUpdateAvailable";
const EXTENSION_LATEST_VERSION_KEY = "extensionLatestVersion";
const EXTENSION_LAST_CHECK_KEY = "extensionLastCheckAt";
const EXTENSION_CHECK_THROTTLE_MS = 30 * 60 * 1e3;
async function checkExtensionUpdate(force = false) {
  if (!force) {
    const stored = await chrome.storage.local.get([EXTENSION_LAST_CHECK_KEY]);
    const lastAt = stored[EXTENSION_LAST_CHECK_KEY];
    if (lastAt && Date.now() - lastAt < EXTENSION_CHECK_THROTTLE_MS) return;
  }
  await chrome.storage.local.set({ [EXTENSION_LAST_CHECK_KEY]: Date.now() });
  try {
    const res = await fetch("https://birthday.agent0s.dev/public/api/extension/latest-version", { method: "GET" });
    if (!res.ok) return;
    const data = await res.json();
    const latest = data?.version;
    if (!latest || typeof latest !== "string") return;
    const current = chrome.runtime.getManifest().version;
    if (isVersionLessThan(current, latest)) {
      await chrome.storage.local.set({
        [EXTENSION_UPDATE_STORAGE_KEY]: true,
        [EXTENSION_LATEST_VERSION_KEY]: latest
      });
      console.log("[Background] New extension version available:", latest, "(current:", current, ")");
    } else {
      await chrome.storage.local.remove([EXTENSION_UPDATE_STORAGE_KEY, EXTENSION_LATEST_VERSION_KEY]);
    }
  } catch (e) {
    console.warn("[Background] Extension version check failed:", e);
  }
}
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("SmartDM.io installed successfully");
    chrome.tabs.create({ url: "https://birthday.agent0s.dev/welcome" });
  } else if (details.reason === "update") {
    console.log(`SmartDM.io updated to version ${chrome.runtime.getManifest().version}`);
    checkExtensionUpdate(true);
  }
  void syncPlatformAiDefaultsIntoStorage();
  chrome.storage.local.remove([
    "messageLogQuickStats",
    "cachedUsage",
    "summaryUsage",
    "dailyStats"
  ]).then(() => {
    console.log("[Background] 🧹 Cleaned up deprecated storage keys");
  });
});
async function findWhatsAppTab() {
  const tabs = await chrome.tabs.query({ url: "https://web.whatsapp.com/*" });
  return tabs[0] || null;
}
const STORAGE_PREFER_WA_STORAGE_QUEUE = "whatsappOutboundPreferStorageQueue";
async function preferWhatsAppOutboundStorageQueue() {
  try {
    const data = await chrome.storage.local.get(STORAGE_PREFER_WA_STORAGE_QUEUE);
    return data[STORAGE_PREFER_WA_STORAGE_QUEUE] === true;
  } catch {
    return false;
  }
}
async function sendStorageBackedWhatsAppMessage(phoneNumber, content, source = "direct") {
  const tab = await findWhatsAppTab();
  if (!tab || !tab.id) {
    return { success: false, error: "WhatsApp Web not open" };
  }
  const storageFirst = await preferWhatsAppOutboundStorageQueue();
  if (!storageFirst) {
    try {
      const result = await chrome.tabs.sendMessage(tab.id, {
        type: "SEND_MESSAGE_DIRECT",
        payload: {
          phoneNumber,
          content,
          skipTracking: source === "calendar_notification"
        }
      });
      return result && typeof result.success === "boolean" ? result : { success: false, error: "Invalid response" };
    } catch {
    }
  }
  const requestId = "cal_" + Date.now() + "_" + Math.random().toString(36).substring(7);
  await chrome.storage.local.set({
    messageRequest: {
      phoneNumber,
      content,
      requestId,
      timestamp: Date.now(),
      source,
      skipTracking: source === "calendar_notification"
    }
  });
  const startTime = Date.now();
  return await new Promise((resolve) => {
    const pollInterval = setInterval(async () => {
      const data = await chrome.storage.local.get("messageResult");
      const result = data.messageResult;
      if (result && result.requestId === requestId) {
        clearInterval(pollInterval);
        await chrome.storage.local.remove("messageResult");
        resolve(result.result || { success: false, error: "Unknown message result" });
      } else if (Date.now() - startTime > 3e4) {
        clearInterval(pollInterval);
        await chrome.storage.local.remove("messageRequest");
        resolve({ success: false, error: "Timeout waiting for WhatsApp to send message" });
      }
    }, 500);
  });
}
function toLocalDateIso(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function dateFromIso(dateIso) {
  return /* @__PURE__ */ new Date(`${dateIso}T00:00:00`);
}
function timeToMinutes(time) {
  const [hours, minutes] = String(time || "00:00").split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}
function getNowPartsInTimezone(timezone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(/* @__PURE__ */ new Date());
  const get = (type) => parts.find((part) => part.type === type)?.value || "00";
  return {
    dateIso: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute"))
  };
}
function renderCalendarNotificationTemplate(template, booking, settings) {
  const bookingDateIso = toLocalDateIso(booking.date);
  const bookingDate = bookingDateIso ? dateFromIso(bookingDateIso) : null;
  const dateText = bookingDate && !Number.isNaN(bookingDate.getTime()) ? bookingDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }) : bookingDateIso;
  return template.replace(/\{name\}/gi, booking.contactName || "there").replace(/\{phone\}/gi, booking.contactPhone || "").replace(/\{date\}/gi, dateText || "").replace(/\{time\}/gi, booking.startTime || "").replace(/\{endTime\}/gi, booking.endTime || "").replace(/\{service\}/gi, booking.service || "appointment").replace(/\{business\}/gi, settings?.businessName || "our office").replace(/\{address\}/gi, settings?.businessAddress || "");
}
async function putRecordInStore(db, storeName, record) {
  await new Promise((resolve, reject) => {
    try {
      if (!db.objectStoreNames.contains(storeName)) {
        reject(new Error(`Store ${storeName} does not exist`));
        return;
      }
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error(`Failed to put record into ${storeName}`));
    } catch (error) {
      reject(error);
    }
  });
}
function getCalendarMinutesUntilBooking(booking, timezone) {
  const bookingDateIso = toLocalDateIso(booking?.date);
  if (!bookingDateIso || !booking?.startTime) return Number.NaN;
  const now = getNowPartsInTimezone(timezone);
  const dayDiff = Math.round((dateFromIso(bookingDateIso).getTime() - dateFromIso(now.dateIso).getTime()) / 864e5);
  const bookingMinutes = timeToMinutes(booking.startTime);
  const nowMinutes = now.hour * 60 + now.minute;
  return dayDiff * 1440 + bookingMinutes - nowMinutes;
}
async function processCalendarNotificationsInBackground() {
  let db = null;
  try {
    const settings = await getCalendarSettings();
    if (!settings?.reminderEnabled && !settings?.confirmationEnabled) {
      return;
    }
    const timezone = settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const reminderBeforeMinutes = Number(settings?.reminderBeforeMinutes || 60);
    const confirmationBeforeMinutes = Number(settings?.confirmationBeforeMinutes || 1440);
    const reminderTemplate = settings?.reminderTemplate || "Hi {name}! 👋 This is a reminder about your appointment at {business} on {date} at {time}. See you soon!";
    const confirmationTemplate = settings?.confirmationTemplate || "Hi {name}! You have an appointment at {business} on {date} at {time}. Is everything still good? Please reply *Yes* to confirm or *No* to cancel.";
    db = await openCrmDb();
    const allBookings = await readAllFromStore(db, "calendarBookings");
    let remindersSent = 0;
    let confirmationsSent = 0;
    for (const booking of allBookings) {
      if (!booking?.id) continue;
      if (!["pending", "confirmed"].includes(String(booking.status || ""))) continue;
      if (!booking.contactPhone) continue;
      const minutesUntilBooking = getCalendarMinutesUntilBooking(booking, timezone);
      if (!Number.isFinite(minutesUntilBooking) || minutesUntilBooking <= 0) continue;
      const shouldSendConfirmation = !!settings?.confirmationEnabled && !!confirmationBeforeMinutes && !booking.confirmationSent && minutesUntilBooking <= confirmationBeforeMinutes && minutesUntilBooking > reminderBeforeMinutes;
      if (shouldSendConfirmation) {
        const message = renderCalendarNotificationTemplate(confirmationTemplate, booking, settings);
        const sendResult = await sendStorageBackedWhatsAppMessage(
          booking.contactPhone,
          message,
          "calendar_notification"
        );
        if (sendResult.success) {
          await putRecordInStore(db, "calendarBookings", {
            ...booking,
            confirmationSent: true,
            confirmationSentAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          });
          confirmationsSent++;
        } else {
          console.warn("[Background] Calendar confirmation failed:", booking.id, sendResult.error);
        }
      }
      const shouldSendReminder = !!settings?.reminderEnabled && !!reminderBeforeMinutes && !booking.reminderSent && minutesUntilBooking <= reminderBeforeMinutes && minutesUntilBooking > 0;
      if (shouldSendReminder) {
        const message = renderCalendarNotificationTemplate(reminderTemplate, booking, settings);
        const sendResult = await sendStorageBackedWhatsAppMessage(
          booking.contactPhone,
          message,
          "calendar_notification"
        );
        if (sendResult.success) {
          await putRecordInStore(db, "calendarBookings", {
            ...booking,
            reminderSent: true,
            reminderSentAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date()
          });
          remindersSent++;
        } else {
          console.warn("[Background] Calendar reminder failed:", booking.id, sendResult.error);
        }
      }
    }
    if (remindersSent > 0 || confirmationsSent > 0) {
      console.log(
        "[Background] Calendar notifications sent:",
        `${remindersSent} reminder(s), ${confirmationsSent} confirmation(s)`
      );
      notifyCalendarBookingsChanged();
    }
  } catch (error) {
    console.warn("[Background] Calendar notification scheduler error:", error);
  } finally {
    db?.close();
  }
}
function renderCalendarOwnerNotificationTemplate(template, booking, settings) {
  const bookingDate = booking.date ? /* @__PURE__ */ new Date(`${booking.date}T00:00:00`) : null;
  const dateText = bookingDate && !Number.isNaN(bookingDate.getTime()) ? bookingDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }) : booking.date || "";
  return template.replace(/\{name\}/gi, booking.contactName || "there").replace(/\{phone\}/gi, booking.contactPhone || "").replace(/\{date\}/gi, dateText).replace(/\{time\}/gi, booking.startTime || "").replace(/\{endTime\}/gi, booking.endTime || "").replace(/\{service\}/gi, booking.service || "appointment").replace(/\{business\}/gi, settings?.businessName || "our office").replace(/\{address\}/gi, settings?.businessAddress || "").replace(/\{source\}/gi, booking.source || "ai");
}
function getCalendarOwnerNotificationRecipients(settings, resources = []) {
  const selectedResourceIds = new Set(
    (Array.isArray(resources) ? resources : []).map((resource) => resource?.itemId).filter(Boolean)
  );
  const additionalPhones = (Array.isArray(settings?.resourceItems) ? settings.resourceItems : []).filter((item) => selectedResourceIds.has(item?.id)).map((item) => String(item?.notificationPhone || "").trim()).filter(Boolean);
  return Array.from(
    new Set(
      [String(settings?.ownerPhone || "").trim(), ...additionalPhones].map((phone) => phone.trim()).filter(Boolean)
    )
  );
}
async function notifyOwnerAboutCalendarToolBooking(args, result) {
  try {
    const settings = await getCalendarSettings();
    if (!settings?.ownerNotifyEnabled || !settings.ownerPhone) return;
    const template = settings.ownerNotifyTemplate || `📅 New booking!

Client: {name}
Phone: {phone}
Date: {date}
Time: {time}

Source: {source}`;
    const message = renderCalendarOwnerNotificationTemplate(
      template,
      {
        contactName: args?.customer_name,
        contactPhone: args?.customer_phone,
        date: result?.data?.date || args?.date,
        startTime: result?.data?.time || args?.time,
        endTime: result?.data?.endTime,
        service: args?.service,
        source: "ai"
      },
      settings
    );
    const recipients = getCalendarOwnerNotificationRecipients(settings, result?.data?.resources);
    for (const phone of recipients) {
      const sendResult = await sendStorageBackedWhatsAppMessage(
        phone,
        message,
        "calendar_notification"
      );
      if (!sendResult.success) {
        console.warn("[Background] Calendar owner notification failed:", phone, sendResult.error);
      } else {
        console.log("[Background] ✅ Calendar owner notification sent:", phone);
      }
    }
  } catch (error) {
    console.warn("[Background] Calendar owner notification error:", error);
  }
}
const MESSAGE_LOGS_KEY = "smartdm_message_logs";
const API_BASE_URL = "https://birthday.agent0s.dev/public/api";
const PLATFORM_AI_STORAGE_KEYS = ["model", "replyDelay", "debounceTime", "maxTokens", "temperature"];
async function syncPlatformAiDefaultsIntoStorage() {
  const token = await getValidToken();
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE_URL}/config/ai-defaults`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const patch = await res.json();
    if (!patch || typeof patch !== "object") return;
    const data = await chrome.storage.local.get(["aiConfig"]);
    const prev = data.aiConfig && typeof data.aiConfig === "object" ? { ...data.aiConfig } : {};
    for (const k of PLATFORM_AI_STORAGE_KEYS) {
      if (patch[k] !== void 0) prev[k] = patch[k];
    }
    await chrome.storage.local.set({ aiConfig: prev });
  } catch (e) {
    console.warn("[Background] syncPlatformAiDefaultsIntoStorage failed", e);
  }
}
async function proxyOpenAIChatCompletion(body) {
  try {
    const token = await getValidToken();
    if (!token) {
      return {
        ok: false,
        httpStatus: 401,
        data: {},
        error: "Not authenticated. Please sign in to SmartDM."
      };
    }
    const res = await fetch(`${API_BASE_URL}/ai/openai-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message || (typeof data?.error === "string" ? data.error : null) || data?.message || `HTTP ${res.status}`;
      return { ok: false, httpStatus: res.status, data, error: msg };
    }
    return { ok: true, httpStatus: res.status, data };
  } catch (e) {
    return {
      ok: false,
      httpStatus: 500,
      data: {},
      error: e instanceof Error ? e.message : String(e)
    };
  }
}
async function proxyOpenAITranscription(formData) {
  try {
    const token = await getValidToken();
    if (!token) {
      return { ok: false, httpStatus: 401, error: "Not authenticated. Please sign in to SmartDM." };
    }
    const res = await fetch(`${API_BASE_URL}/ai/openai-transcriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message || (typeof data?.error === "string" ? data.error : null) || data?.message || `HTTP ${res.status}`;
      return { ok: false, httpStatus: res.status, error: msg, data };
    }
    return { ok: true, data };
  } catch (e) {
    return { ok: false, httpStatus: 500, error: e instanceof Error ? e.message : String(e) };
  }
}
const PENDING_SYNC_KEY = "pendingMessageSyncs";
async function queuePendingSync(payload) {
  try {
    const data = await chrome.storage.local.get([PENDING_SYNC_KEY]);
    const queue = data[PENDING_SYNC_KEY] || [];
    queue.push({ ...payload, queuedAt: Date.now() });
    if (queue.length > 500) queue.splice(0, queue.length - 500);
    await chrome.storage.local.set({ [PENDING_SYNC_KEY]: queue });
  } catch (e) {
    console.warn("[Background] Failed to queue pending sync:", e);
  }
}
async function flushPendingSyncs() {
  try {
    const token = await getValidToken();
    if (!token) return;
    const data = await chrome.storage.local.get([PENDING_SYNC_KEY]);
    const queue = data[PENDING_SYNC_KEY] || [];
    if (queue.length === 0) return;
    console.log("[Background] 🔄 Flushing", queue.length, "pending message syncs to backend...");
    let successCount = 0;
    const failedItems = [];
    for (const item of queue) {
      try {
        const { queuedAt, ...payload } = item;
        const response = await fetch(`${API_BASE_URL}/usage/log-message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          successCount++;
        } else {
          failedItems.push(item);
        }
      } catch {
        failedItems.push(item);
      }
    }
    await chrome.storage.local.set({ [PENDING_SYNC_KEY]: failedItems });
    console.log("[Background] ✅ Flushed", successCount, "messages,", failedItems.length, "remaining");
  } catch (e) {
    console.warn("[Background] Failed to flush pending syncs:", e);
  }
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "PING":
      sendResponse({ success: true, message: "PONG" });
      break;
    case "SMARTDM_CREATE_BASIC_NOTIFICATION": {
      const p = message.payload;
      if (!p?.notificationId || !p?.title || !p?.message) {
        sendResponse({ success: false, error: "invalid payload" });
        break;
      }
      if (!chrome.notifications?.create) {
        sendResponse({ success: false, error: "notifications unavailable" });
        break;
      }
      const clearAfter = typeof p.clearAfterMs === "number" ? p.clearAfterMs : 1e4;
      chrome.notifications.create(
        p.notificationId,
        {
          type: "basic",
          iconUrl: chrome.runtime.getURL("icons/icon128.png"),
          title: p.title,
          message: p.message,
          contextMessage: p.contextMessage,
          priority: 2,
          requireInteraction: false
        },
        () => {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          sendResponse({ success: true });
          setTimeout(() => {
            chrome.notifications.clear(p.notificationId, () => {
            });
          }, clearAfter);
        }
      );
      return true;
    }
    case "GET_TOUR_COMPLETED":
      chrome.storage.local.get(["sdmWebWhatsAppTourCompleted"], (result) => {
        const value = result?.sdmWebWhatsAppTourCompleted;
        sendResponse({ completed: value === true || value === "true" });
      });
      return true;
    case "SET_TOUR_COMPLETED":
      chrome.storage.local.set({ sdmWebWhatsAppTourCompleted: true }, () => {
        sendResponse({ success: !chrome.runtime.lastError });
      });
      return true;
    case "CHECK_EXTENSION_UPDATE":
      checkExtensionUpdate().then(() => sendResponse({ success: true })).catch(() => sendResponse({ success: false }));
      return true;
    case "OPEN_EXTENSIONS_PAGE":
      chrome.tabs.create({ url: "chrome://extensions" });
      sendResponse({ success: true });
      break;
    case "SYNC_DATA":
      sendResponse({ success: true });
      break;
    case "FETCH_USAGE":
      (async () => {
        try {
          await fetchAndCacheUsage();
          const data = await chrome.storage.local.get(["realtimeUsage"]);
          sendResponse({ success: true, usage: data.realtimeUsage });
        } catch (error) {
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "REFRESH_WORKSPACE":
      (async () => {
        try {
          const token = await getValidToken();
          if (!token) {
            sendResponse({ success: false, error: "Not authenticated" });
            return;
          }
          const response = await fetch(`${API_BASE_URL}/workspace/me`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (!response.ok) {
            sendResponse({ success: false, error: `HTTP ${response.status}` });
            return;
          }
          const workspace = await response.json();
          await chrome.storage.local.set({ workspace });
          console.log("[Background] ✅ Workspace refreshed, plan:", workspace?.plan?.name);
          sendResponse({ success: true, workspace });
        } catch (error) {
          console.error("[Background] ❌ REFRESH_WORKSPACE error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "GET_EXTENSION_INSTALL_PING_STATUS":
      (async () => {
        const INSTALL_PING_MAP_KEY = "extensionInstallWhatsappPingByWorkspaceId";
        try {
          const token = await getValidToken();
          if (!token) {
            sendResponse({ success: false, error: "Not authenticated" });
            return;
          }
          const response = await fetch(`${API_BASE_URL}/workspace/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.ok) {
            sendResponse({ success: false, error: `HTTP ${response.status}` });
            return;
          }
          const workspace = await response.json();
          const sentAt = workspace.extensionInstallWhatsappSentAt ?? null;
          const wid = workspace.id !== void 0 && workspace.id !== null ? String(workspace.id) : void 0;
          const stored = await chrome.storage.local.get(["workspace", INSTALL_PING_MAP_KEY]);
          const prevMap = stored[INSTALL_PING_MAP_KEY] ?? {};
          const w = stored.workspace;
          const patch = {};
          if (sentAt && wid && prevMap[wid] !== sentAt) {
            patch[INSTALL_PING_MAP_KEY] = { ...prevMap, [wid]: sentAt };
          }
          if (w && typeof w === "object" && wid && String(w.id) === wid && sentAt && w.extensionInstallWhatsappSentAt !== sentAt) {
            patch.workspace = {
              ...w,
              extensionInstallWhatsappSentAt: sentAt
            };
          }
          if (Object.keys(patch).length > 0) {
            await chrome.storage.local.set(patch);
          }
          sendResponse({
            success: true,
            extensionInstallWhatsappSentAt: sentAt,
            workspaceId: wid
          });
        } catch (error) {
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "RECORD_EXTENSION_INSTALL_WHATSAPP_PING":
      (async () => {
        const INSTALL_PING_MAP_KEY = "extensionInstallWhatsappPingByWorkspaceId";
        try {
          const token = await getValidToken();
          if (!token) {
            sendResponse({ success: false, error: "Not authenticated" });
            return;
          }
          const response = await fetch(
            `${API_BASE_URL}/workspace/me/extension-install-whatsapp-ping`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          if (!response.ok) {
            sendResponse({ success: false, error: `HTTP ${response.status}` });
            return;
          }
          const data = await response.json();
          const stored = await chrome.storage.local.get(["workspace", INSTALL_PING_MAP_KEY]);
          const w = stored.workspace;
          const wid = w?.id !== void 0 && w?.id !== null ? String(w.id) : void 0;
          const prevMap = stored[INSTALL_PING_MAP_KEY] ?? {};
          const sentAt = data.extensionInstallWhatsappSentAt;
          const map = sentAt && wid ? { ...prevMap, [wid]: sentAt } : { ...prevMap };
          const patch = { [INSTALL_PING_MAP_KEY]: map };
          if (w && typeof w === "object" && sentAt) {
            patch.workspace = {
              ...w,
              extensionInstallWhatsappSentAt: sentAt
            };
          }
          await chrome.storage.local.set(patch);
          sendResponse({ success: true, ...data });
        } catch (error) {
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "WHATSAPP_PHONE_DETECTED":
      if (message.phone && typeof message.phone === "string") {
        (async () => {
          const stored = await chrome.storage.local.get(["workspace"]);
          await chrome.storage.local.set({ currentWhatsappPhone: message.phone });
          sendResponse({ success: true });
          try {
            const token = await getValidToken();
            if (!token) return;
            if (stored.workspace?.whatsappPhone === message.phone) return;
            const res = await fetch(
              `${API_BASE_URL}/workspace/by-phone/${encodeURIComponent(message.phone)}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) return;
            const { workspace } = await res.json();
            const switchRes = await fetch(`${API_BASE_URL}/workspace/switch`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ workspaceId: workspace.id })
            });
            if (!switchRes.ok) return;
            const { accessToken } = await switchRes.json();
            await chrome.storage.local.set({ accessToken, workspace });
            console.log("[Background] Switched to workspace by WhatsApp phone:", workspace.name);
          } catch {
          }
        })();
      } else {
        sendResponse({ success: false });
      }
      return true;
    case "GET_WHATSAPP_PHONE":
      chrome.storage.local.get(["currentWhatsappPhone"], (result) => {
        sendResponse({ phone: result?.currentWhatsappPhone ?? null });
      });
      return true;
    case "CHECK_CRM_TAB_OPEN":
      (async () => {
        try {
          const base = chrome.runtime.getURL("crm/index.html");
          const baseCrm = chrome.runtime.getURL("crm/");
          const tabs = await chrome.tabs.query({});
          const crmTab = tabs.find((t) => {
            const u = t.url || "";
            return u.startsWith(base) || u.startsWith(baseCrm);
          });
          const open = !!crmTab?.id;
          if (open) console.log("[Background] CHECK_CRM_TAB_OPEN: CRM tab found", crmTab.url?.slice(0, 60));
          else console.log("[Background] CHECK_CRM_TAB_OPEN: no CRM tab, checked", tabs.length, "tabs, base:", base.slice(0, 50));
          sendResponse({ crmTabOpen: open });
        } catch (e) {
          console.warn("[Background] CHECK_CRM_TAB_OPEN error:", e);
          sendResponse({ crmTabOpen: false });
        }
      })();
      return true;
    case "GET_WHATSAPP_WORKSPACE_MODAL_STATE":
      (async () => {
        const data = await chrome.storage.local.get([
          "accessToken",
          "workspace",
          "currentWhatsappPhone"
        ]);
        const hasAuth = !!data.accessToken && !!data.workspace;
        const phone = data.currentWhatsappPhone ?? null;
        const workspaceHasPhone = !!data.workspace?.whatsappPhone;
        const show = hasAuth && !!phone && !workspaceHasPhone;
        const workspaceName = data.workspace?.name ?? null;
        sendResponse({ show, phone, workspaceName });
      })();
      return true;
    case "CREATE_WORKSPACE_WITH_WHATSAPP_PHONE":
      (async () => {
        try {
          const token = await getValidToken();
          if (!token) {
            sendResponse({ success: false, error: "Not authenticated" });
            return;
          }
          const { currentWhatsappPhone } = await chrome.storage.local.get(["currentWhatsappPhone"]);
          if (!currentWhatsappPhone) {
            sendResponse({ success: false, error: "WhatsApp phone not detected. Open WhatsApp Web and refresh." });
            return;
          }
          const name = `WhatsApp ${currentWhatsappPhone}`;
          const createRes = await fetch(`${API_BASE_URL}/workspace`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ name, whatsappPhone: currentWhatsappPhone })
          });
          if (!createRes.ok) {
            const err = await createRes.json().catch(() => ({}));
            sendResponse({ success: false, error: err.error || "Failed to create workspace" });
            return;
          }
          const { workspace } = await createRes.json();
          const switchRes = await fetch(`${API_BASE_URL}/workspace/switch`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ workspaceId: workspace.id })
          });
          if (!switchRes.ok) {
            sendResponse({ success: false, error: "Workspace created but failed to switch" });
            return;
          }
          const { accessToken } = await switchRes.json();
          await chrome.storage.local.set({
            accessToken,
            workspace,
            hasSeenWhatsAppWorkspaceModal: true
          });
          sendResponse({ success: true, workspace });
        } catch (e) {
          sendResponse({ success: false, error: String(e) });
        }
      })();
      return true;
    case "LINK_WHATSAPP_PHONE_TO_WORKSPACE":
      (async () => {
        try {
          const token = await getValidToken();
          if (!token) {
            sendResponse({ success: false, error: "Not authenticated" });
            return;
          }
          const { workspace: currentWorkspace, currentWhatsappPhone } = await chrome.storage.local.get([
            "workspace",
            "currentWhatsappPhone"
          ]);
          if (!currentWorkspace?.id) {
            sendResponse({ success: false, error: "No current workspace" });
            return;
          }
          if (!currentWhatsappPhone) {
            sendResponse({ success: false, error: "WhatsApp phone not detected. Open WhatsApp Web and refresh." });
            return;
          }
          const patchRes = await fetch(`${API_BASE_URL}/workspace/${currentWorkspace.id}`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ whatsappPhone: currentWhatsappPhone })
          });
          if (!patchRes.ok) {
            const err = await patchRes.json().catch(() => ({}));
            sendResponse({ success: false, error: err.error || "Failed to link phone to workspace" });
            return;
          }
          const { workspace } = await patchRes.json();
          await chrome.storage.local.set({
            workspace,
            hasSeenWhatsAppWorkspaceModal: true
          });
          console.log("[Background] ✅ WhatsApp phone linked to workspace in DB:", workspace?.id, workspace?.whatsappPhone);
          sendResponse({ success: true, workspace });
        } catch (e) {
          console.error("[Background] LINK_WHATSAPP_PHONE_TO_WORKSPACE failed:", e);
          sendResponse({ success: false, error: String(e) });
        }
      })();
      return true;
    case "OPENAI_CHAT_COMPLETION":
      (async () => {
        const result = await proxyOpenAIChatCompletion(message.payload);
        if (result.ok) {
          sendResponse({ ok: true, httpStatus: result.httpStatus, data: result.data });
        } else {
          sendResponse({
            ok: false,
            httpStatus: result.httpStatus,
            data: result.data,
            error: result.error
          });
        }
      })();
      return true;
    case "TRANSLATE_TEXT":
      (async () => {
        try {
          const { text, targetLang } = message.payload || {};
          if (!text || !targetLang) {
            sendResponse({ success: false, error: "Missing text or targetLang" });
            return;
          }
          const langNames = {
            en: "English",
            ru: "Russian",
            az: "Azerbaijani",
            tr: "Turkish",
            ar: "Arabic",
            pt: "Portuguese",
            es: "Spanish",
            fr: "French",
            de: "German",
            it: "Italian",
            zh: "Chinese",
            ja: "Japanese",
            ko: "Korean",
            hi: "Hindi",
            uk: "Ukrainian",
            pl: "Polish",
            nl: "Dutch",
            id: "Indonesian",
            vi: "Vietnamese",
            th: "Thai"
          };
          const langName = langNames[targetLang] || targetLang;
          const proxyResult = await proxyOpenAIChatCompletion({
            model: "gpt-4o-mini",
            temperature: 0.1,
            max_completion_tokens: 1e3,
            messages: [
              {
                role: "system",
                content: `You are a professional translator. Translate the given text to ${langName}. Rules:
- Return ONLY the translated text, nothing else.
- Preserve the original tone and meaning.
- Do NOT add quotation marks, explanations, or notes.
- Do NOT include timestamps or metadata.
- If the text is already in ${langName}, return it as-is.`
              },
              {
                role: "user",
                content: text
              }
            ]
          });
          if (!proxyResult.ok) {
            console.error("[Background] TRANSLATE_TEXT OpenAI error:", proxyResult.error);
            sendResponse({ success: false, error: proxyResult.error });
            return;
          }
          const data = proxyResult.data;
          const translated = data?.choices?.[0]?.message?.content?.trim() || "";
          if (!translated) {
            sendResponse({ success: false, error: "Empty translation response" });
            return;
          }
          sendResponse({ success: true, translated, detectedLang: "auto" });
        } catch (error) {
          console.error("[Background] TRANSLATE_TEXT error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "LOG_MESSAGE":
      (async () => {
        try {
          const entry = message.payload;
          if (!entry || !entry.phoneNumber) {
            sendResponse({ success: false, error: "Invalid log entry" });
            return;
          }
          console.log("[Background] 📊 LOG_MESSAGE:", entry.direction, entry.type, entry.phoneNumber);
          const result = await chrome.storage.local.get([MESSAGE_LOGS_KEY]);
          const logs = result[MESSAGE_LOGS_KEY] || [];
          const token = await getValidToken();
          logs.push(entry);
          if (logs.length > 1e4) {
            logs.splice(0, logs.length - 1e4);
          }
          await chrome.storage.local.set({ [MESSAGE_LOGS_KEY]: logs });
          console.log("[Background] ✅ Message logged locally");
          const syncPayload = {
            type: entry.type,
            direction: entry.direction,
            phoneNumber: entry.phoneNumber,
            contactName: entry.contactName,
            content: entry.content || "",
            // v6.0: Add message content
            timestamp: entry.timestamp,
            isAIGenerated: entry.isAIGenerated,
            aiGenerationTimeMs: entry.aiGenerationTimeMs,
            campaignId: entry.campaignId,
            flowId: entry.flowId,
            status: entry.status,
            metadata: entry.metadata || {}
            // v6.0: Add metadata
          };
          if (token) {
            try {
              const response = await fetch(`${API_BASE_URL}/usage/log-message`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(syncPayload)
              });
              if (response.ok) {
                console.log("[Background] ✅ Message synced to backend (DB will update via Realtime)");
              } else {
                console.warn("[Background] ⚠️ Backend sync failed:", response.status, "— queuing for retry");
                await queuePendingSync(syncPayload);
              }
            } catch (syncError) {
              console.warn("[Background] ⚠️ Backend sync error — queuing for retry:", syncError);
              await queuePendingSync(syncPayload);
            }
          } else {
            console.log("[Background] ℹ️ No auth token — queuing message for sync when authenticated");
            await queuePendingSync(syncPayload);
          }
          sendResponse({ success: true });
        } catch (error) {
          console.error("[Background] ❌ LOG_MESSAGE error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "GET_MESSAGE_LOGS":
      (async () => {
        try {
          const { period } = message.payload || {};
          const result = await chrome.storage.local.get([MESSAGE_LOGS_KEY]);
          let logs = result[MESSAGE_LOGS_KEY] || [];
          if (period) {
            const now = /* @__PURE__ */ new Date();
            let startDate = null;
            switch (period) {
              case "today":
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
              case "7days":
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
                break;
              case "30days":
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
                break;
            }
            if (startDate) {
              logs = logs.filter((l) => new Date(l.timestamp) >= startDate);
            }
          }
          sendResponse({ success: true, logs });
        } catch (error) {
          console.error("[Background] ❌ GET_MESSAGE_LOGS error:", error);
          sendResponse({ success: false, error: String(error), logs: [] });
        }
      })();
      return true;
    case "GET_QUICK_STATS":
      (async () => {
        try {
          const result = await chrome.storage.local.get(["realtimeUsage"]);
          const ru = result.realtimeUsage || {};
          const stats = {
            totalOutgoing: ru.messagesSent || 0,
            totalIncoming: 0,
            todayOutgoing: ru.messagesSent || 0,
            todayIncoming: 0,
            lastUpdated: ru.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
          };
          sendResponse({ success: true, stats });
        } catch (error) {
          console.error("[Background] ❌ GET_QUICK_STATS error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "GET_AUTH_TOKEN":
      (async () => {
        const token = await getValidToken();
        sendResponse({ token });
      })();
      return true;
    case "OPEN_LOGIN":
            chrome.tabs.create({ url: "https://birthday.agent0s.dev/public/account-login.php?from=extension" });
      sendResponse({ success: true });
      break;
    case "AUTH_SYNCED":
      sendResponse({ success: true });
      break;
    case "ACTIVATE_WHATSAPP_TAB":
      (async () => {
        try {
          const waTab = await findWhatsAppTab();
          if (!waTab?.id) {
            sendResponse({ success: false });
            return;
          }
          let previousTabId;
          let previousWindowId;
          try {
            const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
            if (activeTab?.id && activeTab.id !== waTab.id) {
              previousTabId = activeTab.id;
              previousWindowId = activeTab.windowId;
            }
          } catch {
          }
          if (waTab.windowId) await chrome.windows.update(waTab.windowId, { focused: true });
          await chrome.tabs.update(waTab.id, { active: true });
          await new Promise((r) => setTimeout(r, 400));
          sendResponse({ success: true, previousTabId, previousWindowId });
        } catch {
          sendResponse({ success: false });
        }
      })();
      return true;
    case "RESTORE_PREVIOUS_TAB":
      (async () => {
        try {
          const { tabId, windowId } = message;
          if (windowId) await chrome.windows.update(windowId, { focused: true });
          if (tabId) await chrome.tabs.update(tabId, { active: true });
          sendResponse({ success: true });
        } catch {
          sendResponse({ success: false });
        }
      })();
      return true;
    case "OPEN_CRM":
      try {
        const crmPath = message.path ? `crm/index.html#${message.path}` : "crm/index.html";
        const crmUrl = chrome.runtime.getURL(crmPath);
        console.log("[Background] Opening CRM:", crmUrl);
        chrome.tabs.create({ url: crmUrl });
        sendResponse({ success: true });
      } catch (err) {
        console.error("[Background] OPEN_CRM error:", err);
        sendResponse({ success: false, error: String(err) });
      }
      break;
    case "EXECUTE_INVENTORY_ACTION":
      if (message.requestId) {
        return false;
      }
      {
        const requestId = "inv_" + Date.now() + "_" + Math.random().toString(36).slice(2);
        (async () => {
          try {
            const base = chrome.runtime.getURL("crm/index.html");
            const tabs = await chrome.tabs.query({});
            const crmTab = tabs.find((t) => t.url?.startsWith(base));
            if (!crmTab?.id) {
              sendResponse({ success: false, message: "CRM is not open. Please open CRM → Inventory to perform this action." });
              return;
            }
            const payload = message.payload || {};
            const resultPromise = new Promise((resolve) => {
              pendingInventoryResults.set(requestId, resolve);
            });
            chrome.runtime.sendMessage({ type: "INVENTORY_EXECUTE_ACTION", requestId, payload }).catch(() => {
            });
            const result = await Promise.race([
              resultPromise,
              new Promise(
                (resolve) => setTimeout(() => {
                  pendingInventoryResults.delete(requestId);
                  resolve({ success: false, message: "CRM did not respond in time. Please try again." });
                }, 15e3)
              )
            ]);
            sendResponse(result ?? { success: false, message: "No response from CRM" });
          } catch (err) {
            pendingInventoryResults.delete(requestId);
            console.warn("[Background] EXECUTE_INVENTORY_ACTION error:", err);
            sendResponse({
              success: false,
              message: "CRM is not open or did not respond. Please open CRM → Inventory and try again."
            });
          }
        })();
        return true;
      }
    case "INVENTORY_ACTION_RESULT":
      if (message.requestId && pendingInventoryResults.has(message.requestId)) {
        pendingInventoryResults.get(message.requestId)(message.result);
        pendingInventoryResults.delete(message.requestId);
      }
      return false;
    case "SEND_SCHEDULED_MESSAGE":
      (async () => {
        try {
          const tab = await findWhatsAppTab();
          if (!tab || !tab.id) {
            sendResponse({ success: false, error: "WhatsApp Web not open" });
            return;
          }
          const storageFirst = await preferWhatsAppOutboundStorageQueue();
          if (!storageFirst) {
            try {
              const result = await chrome.tabs.sendMessage(tab.id, { type: "SEND_SCHEDULED_MESSAGE", payload: message.payload });
              sendResponse(result ?? { success: false, error: "No response" });
              return;
            } catch {
            }
          }
          const requestId = "req_" + Date.now() + "_" + Math.random();
          await chrome.storage.local.set({ messageRequest: { ...message.payload, requestId, timestamp: Date.now() } });
          const startTime = Date.now();
          const pollInterval = setInterval(async () => {
            const data = await chrome.storage.local.get("messageResult");
            const result = data.messageResult;
            if (result && result.requestId === requestId) {
              clearInterval(pollInterval);
              await chrome.storage.local.remove("messageResult");
              sendResponse(result.result);
            } else if (Date.now() - startTime > 3e4) {
              clearInterval(pollInterval);
              sendResponse({ success: false, error: "Timeout" });
            }
          }, 500);
        } catch (error) {
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "SEND_CAMPAIGN_MESSAGE":
      (async () => {
        try {
          const tab = await findWhatsAppTab();
          if (!tab || !tab.id) {
            sendResponse({ success: false, error: "WhatsApp Web не открыт. Откройте web.whatsapp.com в браузере." });
            return;
          }
          const storageFirst = await preferWhatsAppOutboundStorageQueue();
          if (!storageFirst) {
            try {
              const result = await chrome.tabs.sendMessage(tab.id, { type: "SEND_CAMPAIGN_MESSAGE", payload: message.payload });
              sendResponse(result ?? { success: false, error: "No response" });
              return;
            } catch {
            }
          }
          const requestId = "req_" + Date.now() + "_" + Math.random().toString(36).substring(7);
          await chrome.storage.local.set({ messageRequest: { ...message.payload, requestId, timestamp: Date.now() } });
          const startTime = Date.now();
          const maxPollTime = 35e3;
          const pollInterval = setInterval(async () => {
            const data = await chrome.storage.local.get("messageResult");
            const result = data.messageResult;
            if (result && result.requestId === requestId) {
              clearInterval(pollInterval);
              await chrome.storage.local.remove("messageResult");
              sendResponse(result.result);
            } else if (Date.now() - startTime > maxPollTime) {
              clearInterval(pollInterval);
              await chrome.storage.local.remove("messageRequest");
              sendResponse({ success: false, error: "Таймаут. Обновите страницу WhatsApp Web." });
            }
          }, 500);
        } catch (error) {
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "SEND_WHATSAPP_MESSAGE":
      (async () => {
        try {
          const { phone, message: msgText } = message;
          if (!phone || !msgText) {
            sendResponse({ success: false, error: "Missing phone or message" });
            return;
          }
          console.log("[Background] 📅 SEND_WHATSAPP_MESSAGE (calendar notification)");
          console.log("[Background]   - Phone:", phone);
          console.log("[Background]   - Message:", msgText.substring(0, 80) + "...");
          const result = await sendStorageBackedWhatsAppMessage(phone, msgText, "calendar_notification");
          console.log("[Background] ✅ Calendar notification sent:", result?.success);
          sendResponse(result);
        } catch (error) {
          console.error("[Background] ❌ SEND_WHATSAPP_MESSAGE error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "SAVE_ACTION":
      sendResponse({ success: true });
      break;
    case "GENERATE_AI_REPLY":
      (async () => {
        try {
          const { contactPhone, userMessage, conversationHistory, campaignGoal, token } = message.payload;
          console.log("[Background] 🤖 GENERATE_AI_REPLY request received");
          console.log("[Background]   - Phone:", contactPhone);
          console.log("[Background]   - Message length:", userMessage?.length || 0);
          console.log("[Background]   - Campaign Goal:", campaignGoal || "(none)");
          console.log("[Background]   - Has token:", !!token);
          if (!token) {
            console.error("[Background] ❌ No auth token");
            sendResponse({ success: false, error: "Not authenticated" });
            return;
          }
          const requestBody = {
            contactPhone,
            message: userMessage,
            conversationHistory,
            campaignGoal
          };
          console.log("[Background] 📤 Sending request to API...");
          console.log("[Background] Request body:", JSON.stringify(requestBody).substring(0, 500));
          const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          };
          const response = await fetch("https://birthday.agent0s.dev/public/api/ai/reply", {
            method: "POST",
            headers,
            body: JSON.stringify(requestBody)
          });
          console.log("[Background] 📥 API response status:", response.status);
          if (!response.ok) {
            let errorDetails = "";
            try {
              const errorText = await response.text();
              errorDetails = errorText.substring(0, 500);
              console.error("[Background] ❌ API error response:", errorDetails);
            } catch (e) {
              console.error("[Background] ❌ Could not read error response");
            }
            if (response.status === 429) {
              try {
                const data2 = JSON.parse(errorDetails);
                sendResponse({ success: false, error: "limit_exceeded", used: data2.used, limit: data2.limit });
              } catch {
                sendResponse({ success: false, error: `Rate limit exceeded` });
              }
            } else if (response.status === 502) {
              console.error("[Background] ❌ 502 Bad Gateway - Backend might be down or restarting");
              sendResponse({ success: false, error: `API error: 502 Bad Gateway - Server unavailable. Details: ${errorDetails}` });
            } else {
              sendResponse({ success: false, error: `API error: ${response.status} - ${errorDetails}` });
            }
            return;
          }
          const data = await response.json();
          console.log("[Background] ✅ AI reply received:", data.reply?.substring(0, 100));
          if (data.tokens) {
            console.log(`[Background] 🎯 Token usage: ${data.tokens.prompt} input + ${data.tokens.completion} output = ${data.tokens.total} total`);
          }
          sendResponse({ success: true, reply: data.reply, usage: data.usage, tokens: data.tokens });
        } catch (error) {
          console.error("[Background] ❌ Exception:", error);
          sendResponse({ success: false, error: `Exception: ${String(error)}` });
        }
      })();
      return true;
    case "AI_PREVIEW":
      (async () => {
        try {
          const { message: testMessage, chatbotRole, customPrompt, language, fixedLanguage, conversationHistory, agentId } = message.payload;
          console.log("[Background] 🧪 AI_PREVIEW request, agentId:", agentId || "(default)");
          const result = await chrome.storage.local.get([
            "aiConfig",
            "aiAgents",
            "effectiveSystemPrompt",
            "effectiveSystemPromptIsJson"
          ]);
          const aiConfig = result.aiConfig || {};
          const syncedAgents = result.aiAgents || [];
          const PREVIEW_LEGACY_MODELS = /* @__PURE__ */ new Set(["gpt-4-turbo-preview", "gpt-4o", "gpt-4", "gpt-3.5-turbo"]);
          let model = aiConfig.model || "gpt-4o-mini";
          if (PREVIEW_LEGACY_MODELS.has(model)) model = "gpt-4o-mini";
          let systemPrompt = "";
          let isJsonMode = false;
          let useAgentMode = false;
          const selectedAgent = agentId ? syncedAgents.find((a) => a.agentId === agentId && a.isActive) : null;
          if (selectedAgent && selectedAgent.systemPrompt) {
            systemPrompt = selectedAgent.systemPrompt;
            isJsonMode = false;
            useAgentMode = true;
            console.log("[Background] Using agent prompt:", selectedAgent.name, "| length:", systemPrompt.length);
          } else if (result.effectiveSystemPrompt) {
            systemPrompt = result.effectiveSystemPrompt;
            isJsonMode = result.effectiveSystemPromptIsJson === true && systemPrompt.toLowerCase().includes("json");
            console.log("[Background] Using cached effectiveSystemPrompt, length:", systemPrompt.length, "isJson:", isJsonMode);
          } else {
            const rolePrompts = {
              customer_service: "You are a real person working as a customer service rep. Chat naturally — short replies, warm and professional. ALWAYS reply in the customer's language. No filler questions.",
              sales_representative: "You are a real person working as a sales consultant. Chat naturally — confident, genuine, not pushy. ALWAYS reply in the customer's language. No filler questions.",
              technical_support: "You are a real person working as a tech support specialist. Chat naturally — clear, concise, practical. ALWAYS reply in the customer's language. No filler questions.",
              appointment_scheduler: "You are a real person working as a scheduling coordinator. Chat naturally — efficient and friendly. ALWAYS reply in the customer's language. No unnecessary follow-ups.",
              custom: customPrompt || "You are a helpful assistant. Chat naturally, be concise. ALWAYS reply in the customer's language."
            };
            systemPrompt = rolePrompts[chatbotRole] || rolePrompts.customer_service;
            if (language === "fixed" && fixedLanguage) {
              const langNames = { ru: "Russian", en: "English", az: "Azerbaijani", tr: "Turkish" };
              systemPrompt += `

IMPORTANT: Always respond in ${langNames[fixedLanguage] || fixedLanguage}.`;
            }
            isJsonMode = false;
            console.log("[Background] Using fallback role-based prompt (no cached effectiveSystemPrompt)");
          }
          const messages = [
            { role: "system", content: systemPrompt }
          ];
          if (Array.isArray(conversationHistory)) {
            for (const msg of conversationHistory) {
              messages.push({ role: msg.role, content: msg.content });
            }
          }
          messages.push({ role: "user", content: testMessage });
          const maxTokens = Math.max(2048, typeof aiConfig.maxTokens === "number" && aiConfig.maxTokens > 0 ? aiConfig.maxTokens : 2048);
          const requestBody = {
            model,
            messages,
            temperature: aiConfig.temperature ?? 0.7,
            max_completion_tokens: maxTokens
          };
          if (isJsonMode) {
            requestBody.response_format = { type: "json_object" };
          }
          console.log("[Background] AI_PREVIEW OpenAI request:", { model, msgCount: messages.length, maxTokens, isJsonMode, agent: selectedAgent?.name || "none" });
          const previewProxy = await proxyOpenAIChatCompletion(requestBody);
          if (!previewProxy.ok) {
            console.error("[Background] AI_PREVIEW OpenAI error:", previewProxy.error);
            sendResponse({ success: false, error: previewProxy.error });
            return;
          }
          const data = previewProxy.data;
          const rawContent = data.choices?.[0]?.message?.content?.trim() || "";
          if (!rawContent) {
            const finishReason = data.choices?.[0]?.finish_reason;
            sendResponse({ success: false, error: `Empty response from AI (finish_reason: ${finishReason || "unknown"})` });
            return;
          }
          let reply = rawContent;
          if (isJsonMode) {
            try {
              const parsed = JSON.parse(rawContent);
              reply = parsed.reply || parsed.message || rawContent;
            } catch {
              reply = rawContent;
            }
          }
          console.log("[Background] 🧪 AI_PREVIEW success, reply length:", reply.length);
          sendResponse({ success: true, reply });
        } catch (error) {
          console.error("[Background] AI Preview error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "ADD_INBOUND_CONTACT":
      (async () => {
        try {
          const { phone, name, pushname, tags, source, firstMessage, firstMessageDate } = message.payload;
          console.log("[Background] 🆕 ADD_INBOUND_CONTACT");
          console.log("[Background]   - Phone:", phone);
          console.log("[Background]   - Name:", name);
          console.log("[Background]   - Pushname:", pushname);
          const storageData = await chrome.storage.local.get(["crmContacts"]);
          const contacts = storageData.crmContacts || [];
          const token = await getValidToken();
          const normalizePhone = (p) => p.replace(/[\s\-\(\)\+]/g, "");
          const normalizedPhone = normalizePhone(phone).slice(-9);
          const existingIndex = contacts.findIndex(
            (c) => normalizePhone(c.phone || "").slice(-9) === normalizedPhone
          );
          if (existingIndex >= 0) {
            console.log("[Background] ℹ️ Contact already exists, updating...");
            const existing = contacts[existingIndex];
            const updatedTags = /* @__PURE__ */ new Set([...existing.tags || [], ...tags]);
            contacts[existingIndex] = {
              ...existing,
              tags: Array.from(updatedTags),
              lastInboundMessage: firstMessage,
              lastInboundDate: firstMessageDate
            };
          } else {
            console.log("[Background] ✅ Creating new inbound contact");
            const newContact = {
              id: crypto.randomUUID(),
              phone,
              name,
              pushname,
              tags,
              source,
              status: "new_lead",
              createdAt: Date.now(),
              customFields: {
                firstMessage,
                firstMessageDate,
                pushname
              }
            };
            contacts.push(newContact);
          }
          await chrome.storage.local.set({ crmContacts: contacts });
          if (token) {
            try {
              console.log("[Background] 📤 Syncing contact to backend...");
              const response = await fetch("https://birthday.agent0s.dev/public/api/contacts/sync", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                  phoneNumber: phone,
                  name,
                  tags,
                  status: "new_lead",
                  notes: firstMessage ? `First message: ${firstMessage}` : "",
                  lastMessageAt: firstMessageDate || (/* @__PURE__ */ new Date()).toISOString()
                })
              });
              if (response.ok) {
                console.log("[Background] ✅ Contact synced to backend");
              } else {
                console.warn("[Background] ⚠️ Backend sync failed:", response.status);
              }
            } catch (syncError) {
              console.warn("[Background] ⚠️ Backend sync error:", syncError);
            }
          } else {
            console.log("[Background] ℹ️ Not authenticated, skipping backend sync");
          }
          const crmTabsRefresh = await chrome.tabs.query({ url: chrome.runtime.getURL("*") });
          for (const tab of crmTabsRefresh) {
            if (tab.id) {
              try {
                await chrome.tabs.sendMessage(tab.id, { type: "CONTACTS_UPDATED" });
              } catch (e) {
              }
            }
          }
          sendResponse({ success: true });
        } catch (error) {
          console.error("[Background] ❌ ADD_INBOUND_CONTACT error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "TRACK_AI_REPLY":
      (async () => {
        try {
          const token = await getValidToken();
          if (!token) {
            console.log("[Background] ℹ️ Not authenticated, skipping AI reply tracking");
            sendResponse({
              success: true,
              limitExceeded: false,
              authRequired: true,
              message: "Please login to track usage"
            });
            return;
          }
          console.log("[Background] 📊 Tracking AI reply...");
          const response = await fetch("https://birthday.agent0s.dev/public/api/usage/track-ai-reply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          if (response.status === 401 || response.status === 403) {
            console.log("[Background] 🔐 Auth error, token may be expired");
            sendResponse({
              success: true,
              limitExceeded: false,
              authRequired: true,
              message: "Session expired, please login again"
            });
            return;
          }
          if (response.status >= 500) {
            console.log("[Background] ⚠️ Server error:", response.status);
            sendResponse({
              success: true,
              limitExceeded: false,
              serverError: true,
              message: "Server temporarily unavailable"
            });
            return;
          }
          const data = await response.json();
          if (response.status === 429 || data.limitExceeded) {
            console.log("[Background] ⚠️ AI reply limit exceeded:", data);
            await chrome.storage.local.set({
              limitExceeded: {
                type: "aiReplies",
                used: data.used,
                limit: data.limit,
                planName: data.planName,
                timestamp: Date.now()
              }
            });
            sendResponse({
              success: false,
              limitExceeded: true,
              used: data.used,
              limit: data.limit,
              planName: data.planName
            });
          } else {
            console.log("[Background] ✅ AI reply tracked:", data.used, "/", data.limit);
            await chrome.storage.local.remove(["limitExceeded"]);
            sendResponse({
              success: true,
              limitExceeded: false,
              used: data.used,
              limit: data.limit
            });
          }
        } catch (error) {
          console.error("[Background] ❌ TRACK_AI_REPLY network error:", error);
          sendResponse({
            success: true,
            limitExceeded: false,
            networkError: true,
            message: "Network error, continuing anyway"
          });
        }
      })();
      return true;
    case "CHECK_MESSAGE_REPLY_STATUS":
      (async () => {
        try {
          const token = await getValidToken();
          const messageId = message.payload?.messageId;
          if (!token || !messageId) {
            sendResponse({ handled: false });
            return;
          }
          const res = await fetch(
            `${API_BASE_URL}/message-reply-status/check?messageId=${encodeURIComponent(messageId)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok) {
            sendResponse({ handled: false });
            return;
          }
          const data = await res.json();
          sendResponse({ handled: !!data.handled, status: data.status });
        } catch {
          sendResponse({ handled: false });
        }
      })();
      return true;
    case "RECORD_MESSAGE_REPLY_STATUS":
      (async () => {
        try {
          const token = await getValidToken();
          const { messageId, status, entries } = message.payload || {};
          if (!token) {
            sendResponse({ ok: false });
            return;
          }
          const body = entries?.length ? { entries } : messageId && (status === "replied" || status === "skipped") ? { messageId, status } : null;
          if (!body) {
            sendResponse({ ok: false });
            return;
          }
          const res = await fetch(`${API_BASE_URL}/message-reply-status/record`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
          });
          sendResponse({ ok: res.ok });
        } catch {
          sendResponse({ ok: false });
        }
      })();
      return true;
    case "GET_CONTACT_CRM_DATA":
      (async () => {
        try {
          let { phone } = message.payload || {};
          if (!phone) {
            sendResponse({ contact: null });
            return;
          }
          phone = phone.replace(/@c\.us$|@s\.whatsapp\.net$|@g\.us$/g, "");
          const digits = phone.replace(/\D/g, "");
          if (digits.length >= 9 && !phone.startsWith("+")) {
            phone = "+" + phone;
          }
          console.log("[Background] 📊 Getting CRM data (direct DB) for:", phone);
          let contact = await findContactByPhone(phone);
          if (!contact) {
            const phoneDigits = phone.replace(/\D/g, "");
            if (phoneDigits.length < 9) {
              console.log("[Background] 🔍 Phone looks like a name, searching by name:", phone);
              const db = await openCrmDb();
              try {
                const contacts = await readAllFromStore(db, "contacts");
                contact = contacts.find((c) => c.name === phone);
                if (contact) {
                  console.log("[Background] ✅ Found contact by name:", contact.name, contact.phoneNumber);
                }
              } finally {
                db?.close();
              }
            }
          }
          if (contact) {
            console.log("[Background] ✅ Found contact in DB:", contact.name);
            sendResponse({
              contact: {
                id: contact.id,
                name: contact.name,
                status: contact.status,
                tags: contact.tags,
                notes: contact.notes,
                customFields: contact.customFields,
                customRecordsCount: 0
              }
            });
          } else {
            console.log("[Background] ⚠️ Contact not found for:", phone);
            sendResponse({ contact: null });
          }
        } catch (error) {
          console.error("[Background] ❌ GET_CONTACT_CRM_DATA error:", error);
          sendResponse({ contact: null, error: String(error) });
        }
      })();
      return true;
    case "GET_CONTACT_FULL_DATA":
      (async () => {
        try {
          const { phone, name } = message.payload || {};
          if (!phone && !name) {
            sendResponse({ success: false, data: null });
            return;
          }
          console.log("[Background] 📊 Getting FULL CRM data (raw IDB) for:", phone || name);
          const timeoutPromise = new Promise(
            (_, reject) => setTimeout(() => reject(new Error("getFullContactData timed out after 8s")), 8e3)
          );
          try {
            const data = await Promise.race([
              getFullContactData(phone || "", name),
              timeoutPromise
            ]);
            console.log("[Background] ✅ CRM data result:", data.inCRM ? "found in CRM" : "not in CRM");
            sendResponse({ success: true, data });
          } catch (timeoutErr) {
            console.error("[Background] ⏱️ CRM data timeout/error:", timeoutErr);
            sendResponse({ success: true, data: { contact: null, inCRM: false, messages: [], customRecords: [], campaigns: [], flowExecutions: [], contactFieldsConfig: [] } });
          }
        } catch (error) {
          console.error("[Background] ❌ GET_CONTACT_FULL_DATA error:", error);
          sendResponse({ success: false, data: null, error: String(error) });
        }
      })();
      return true;
    case "FIND_CRM_CONTACT_BY_PHONE":
      (async () => {
        try {
          const phone = message.phone || message.payload?.phone || "";
          if (!phone) {
            sendResponse({ success: false, contact: null });
            return;
          }
          const contact = await findContactByPhone(phone);
          sendResponse({ success: true, contact: contact ?? null });
        } catch (e) {
          sendResponse({ success: false, contact: null });
        }
      })();
      return true;
    case "FIND_CRM_CONTACT_BY_ID":
      (async () => {
        try {
          const id = message.contactId ?? message.payload?.contactId;
          if (id == null) {
            sendResponse({ success: false, contact: null });
            return;
          }
          const contact = await getContactById(Number(id));
          sendResponse({ success: true, contact: contact ?? null });
        } catch (e) {
          sendResponse({ success: false, contact: null });
        }
      })();
      return true;
    case "CREATE_CONTACT":
      (async () => {
        const phoneSuffixKey = (p) => p.replace(/\D/g, "").slice(-9) || p;
        try {
          const { phone, name } = message.payload || {};
          if (!phone) {
            sendResponse({ success: false, error: "No phone provided" });
            return;
          }
          const key = phoneSuffixKey(phone);
          if (createContactPendingKeys.has(key)) {
            const p = createContactPending.get(key);
            if (p) await p;
            const existingAfter = await findContactByPhone(phone).catch(() => void 0);
            if (existingAfter) {
              sendResponse({ success: true, contactId: existingAfter.id, existing: true, existingContact: { id: existingAfter.id, name: existingAfter.name, phone: existingAfter.phoneNumber, status: existingAfter.status, createdAt: existingAfter.createdAt } });
            } else {
              sendResponse({ success: false, error: "Contact creation in progress, please wait." });
            }
            return;
          }
          createContactPendingKeys.add(key);
          const pending = new Promise((resolve) => {
            createContactPendingResolve.set(key, resolve);
          });
          createContactPending.set(key, pending);
          try {
            console.log("[Background] ➕ Creating contact:", phone, name);
            const existing = await findContactByPhone(phone).catch(() => void 0);
            if (existing) {
              console.log("[Background] ⚠️ Contact already exists:", existing.id, existing.name);
              sendResponse({
                success: true,
                contactId: existing.id,
                existing: true,
                existingContact: {
                  id: existing.id,
                  name: existing.name,
                  phone: existing.phoneNumber,
                  status: existing.status,
                  createdAt: existing.createdAt
                }
              });
              return;
            }
            let contactId = null;
            try {
              contactId = await createContact(phone, name || phone);
            } catch (dbErr) {
              console.warn("[Background] Direct DB create failed:", dbErr);
            }
            if (contactId !== null) {
              console.log("[Background] ✅ Contact created, id:", contactId);
              notifyCrmContactChanged();
              sendResponse({ success: true, contactId });
              return;
            }
            const allExtensionTabs = await chrome.tabs.query({ url: chrome.runtime.getURL("*") });
            const crmTabs = allExtensionTabs.filter((t) => t.url && t.url.includes("/crm/"));
            let created = false;
            const firstCrmTab = crmTabs[0];
            if (firstCrmTab?.id) {
              try {
                const payload = { type: "CREATE_CONTACT", phone, name, payload: { phone, name }, fromBackground: true };
                const response = await chrome.tabs.sendMessage(firstCrmTab.id, payload);
                if (response?.success) {
                  created = true;
                  sendResponse(response);
                } else if (response && !response.success) {
                  sendResponse(response);
                }
              } catch {
              }
            }
            if (!created) {
              console.log("[Background] ⚠️ DB not ready, opening CRM tab...");
              try {
                const crmUrl = chrome.runtime.getURL("crm/index.html");
                const newTab = await chrome.tabs.create({ url: crmUrl, active: false });
                await new Promise((r) => setTimeout(r, 3e3));
                const retryId = await createContact(phone, name || phone);
                if (retryId !== null) {
                  console.log("[Background] ✅ Contact created after CRM init, id:", retryId);
                  notifyCrmContactChanged();
                  sendResponse({ success: true, contactId: retryId });
                  try {
                    if (newTab.id) chrome.tabs.remove(newTab.id);
                  } catch {
                  }
                } else {
                  sendResponse({ success: false, error: "Please open the CRM tab first, then try again." });
                }
              } catch {
                sendResponse({ success: false, error: "Please open the CRM tab first, then try again." });
              }
            }
          } finally {
            createContactPendingKeys.delete(key);
            createContactPendingResolve.get(key)?.();
            createContactPendingResolve.delete(key);
            createContactPending.delete(key);
          }
        } catch (error) {
          console.error("[Background] ❌ CREATE_CONTACT error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "UPDATE_CONTACT_NOTES":
      (async () => {
        try {
          const { phone, notes, name } = message.payload || {};
          if (!phone) {
            sendResponse({ success: false, error: "No phone provided" });
            return;
          }
          const phoneSuffix = phone.replace(/[\s\-\(\)\+]/g, "").slice(-9);
          console.log("[Background] 📝 Updating notes for:", phone, "(suffix:", phoneSuffix, ")");
          const crmTabsUpdate = await chrome.tabs.query({ url: chrome.runtime.getURL("*") });
          let updated = false;
          for (const tab of crmTabsUpdate) {
            if (tab.id) {
              try {
                const response = await chrome.tabs.sendMessage(tab.id, {
                  type: "UPDATE_CONTACT_NOTES",
                  phone: phoneSuffix,
                  // For lookup
                  fullPhone: phone,
                  // Full phone for new contacts
                  notes,
                  name
                });
                if (response?.success) {
                  updated = true;
                  break;
                }
              } catch (e) {
              }
            }
          }
          if (!updated) {
            const pending = await chrome.storage.local.get(["pendingContactUpdates"]);
            const updates = pending.pendingContactUpdates || [];
            updates.push({ phone, phoneSuffix, notes, name, timestamp: Date.now() });
            await chrome.storage.local.set({ pendingContactUpdates: updates });
            sendResponse({ success: true, pending: true });
          } else {
            sendResponse({ success: true });
          }
        } catch (error) {
          console.error("[Background] ❌ UPDATE_CONTACT_NOTES error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "UPDATE_CONTACT_SIDEBAR":
      (async () => {
        try {
          const { phone, status, tags, notes } = message.payload || {};
          if (!phone) {
            sendResponse({ success: false, error: "No phone provided" });
            return;
          }
          const updates = {};
          if (status !== void 0) updates.status = status;
          if (tags !== void 0) updates.tags = tags;
          if (notes !== void 0) updates.notes = notes;
          if (Object.keys(updates).length === 0) {
            sendResponse({ success: true });
            return;
          }
          const ok = await updateContactByPhone(phone, updates);
          if (ok) notifyCrmContactChanged();
          sendResponse({ success: ok });
        } catch (error) {
          console.error("[Background] ❌ UPDATE_CONTACT_SIDEBAR error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "GET_DASHBOARD_STATS":
      (async () => {
        try {
          const { period = "7days" } = message.payload || {};
          const token = await getValidToken();
          if (!token) {
            console.log("[Background] ❌ GET_DASHBOARD_STATS: No auth token");
            sendResponse({ success: false, error: "Not authenticated" });
            return;
          }
          console.log("[Background] 📊 Fetching dashboard stats from API, period:", period);
          const response = await fetch(`${API_BASE_URL}/usage/dashboard-stats?period=${period}`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (!response.ok) {
            console.error("[Background] ❌ Dashboard stats API error:", response.status);
            sendResponse({ success: false, error: `API error: ${response.status}` });
            return;
          }
          const data = await response.json();
          console.log("[Background] ✅ Dashboard stats fetched successfully");
          sendResponse(data);
        } catch (error) {
          console.error("[Background] ❌ GET_DASHBOARD_STATS error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "GET_CONTACT_MESSAGES":
      (async () => {
        try {
          const { phoneNumber, limit = 30, offset = 0 } = message.payload || {};
          const token = await getValidToken();
          if (!token) {
            console.log("[Background] ❌ GET_CONTACT_MESSAGES: No auth token");
            sendResponse({ success: false, error: "Not authenticated" });
            return;
          }
          if (!phoneNumber) {
            console.error("[Background] ❌ GET_CONTACT_MESSAGES: Phone number required");
            sendResponse({ success: false, error: "Phone number is required" });
            return;
          }
          console.log("[Background] 📨 Fetching messages for contact:", phoneNumber);
          const response = await fetch(
            `${API_BASE_URL}/contacts/${encodeURIComponent(phoneNumber)}/messages?limit=${limit}&offset=${offset}`,
            { headers: { "Authorization": `Bearer ${token}` } }
          );
          if (!response.ok) {
            console.error("[Background] ❌ Messages API error:", response.status);
            sendResponse({ success: false, error: `API error: ${response.status}` });
            return;
          }
          const data = await response.json();
          console.log("[Background] ✅ Messages fetched successfully:", data.total);
          sendResponse(data);
        } catch (error) {
          console.error("[Background] ❌ GET_CONTACT_MESSAGES error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "GET_TEMPLATES":
      (async () => {
        try {
          const templates = await getTemplates();
          sendResponse({ success: true, templates });
        } catch (err) {
          sendResponse({ success: false, templates: [], error: String(err) });
        }
      })();
      return true;
    case "CREATE_TEMPLATE":
      (async () => {
        try {
          const { title, content, category, shortcut } = message.payload || {};
          if (!title?.trim() || !content?.trim()) {
            sendResponse({ success: false, error: "Title and content are required" });
            return;
          }
          const id = await addTemplate({ title, content, category, shortcut });
          if (id != null) {
            sendResponse({ success: true, id });
          } else {
            sendResponse({ success: false, error: "Failed to create template" });
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "GET_CONTACT_BOOKINGS":
      (async () => {
        try {
          const { phone } = message.payload || {};
          const bookings = await getContactBookings(phone || "");
          sendResponse({ success: true, bookings });
        } catch (err) {
          sendResponse({ success: false, bookings: [], error: String(err) });
        }
      })();
      return true;
    case "GET_AVAILABLE_SLOTS":
      (async () => {
        try {
          const { date } = message.payload || {};
          const slots = await getAvailableSlots(date);
          const settings = await getCalendarSettings();
          sendResponse({ success: true, slots, slotDuration: settings?.slotDuration || 30 });
        } catch (err) {
          sendResponse({ success: false, slots: [], error: String(err) });
        }
      })();
      return true;
    case "GET_CALENDAR_SETTINGS":
      (async () => {
        try {
          const settings = await getCalendarSettings();
          const promptHint = getCalendarPromptHint(settings);
          sendResponse({ success: true, settings, promptHint: promptHint ?? void 0 });
        } catch (err) {
          sendResponse({ success: false, settings: null, error: String(err) });
        }
      })();
      return true;
    case "CREATE_QUICK_BOOKING":
      (async () => {
        try {
          const id = await createQuickBooking(message.payload);
          sendResponse({ success: !!id, bookingId: id });
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "EXECUTE_CALENDAR_TOOL":
      (async () => {
        try {
          const { toolName, args } = message.payload || {};
          const result = await executeCalendarTool(toolName, args || {});
          console.log("[Background] Calendar tool result:", toolName, result);
          if (toolName === "book_appointment" && result?.success) {
            await notifyOwnerAboutCalendarToolBooking(args || {}, result);
          }
          if ((toolName === "book_appointment" || toolName === "cancel_booking" || toolName === "reschedule_booking" || toolName === "change_booking_resource") && result?.success) {
            notifyCalendarBookingsChanged();
          }
          sendResponse(result);
        } catch (err) {
          sendResponse({ success: false, message: "Calendar tool execution failed.", error: String(err) });
        }
      })();
      return true;
    case "GET_ACTIVE_FLOWS":
      (async () => {
        try {
          const flows = await getActiveFlows();
          sendResponse({ success: true, flows });
        } catch (err) {
          sendResponse({ success: false, flows: [], error: String(err) });
        }
      })();
      return true;
    case "START_FLOW_FOR_CONTACT":
      (async () => {
        try {
          const { flowId, contactId, contactName } = message.payload || {};
          const id = await createFlowExecution(flowId, contactId, contactName);
          sendResponse({ success: !!id, executionId: id });
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "GET_AI_AGENTS":
      (async () => {
        try {
          const agents = await getAIAgents();
          sendResponse({ success: true, agents });
        } catch (err) {
          sendResponse({ success: false, agents: [], error: String(err) });
        }
      })();
      return true;
    case "CREATE_SCHEDULED_MESSAGE":
      (async () => {
        try {
          console.log("[Background] 📅 CREATE_SCHEDULED_MESSAGE received");
          const payload = message.payload || {};
          const phone = payload.phone;
          const contactName = payload.contactName;
          const msgText = payload.message;
          const scheduledAt = payload.scheduledAt;
          console.log("[Background] 📅 Data:", { phone, contactName, msgText: msgText?.substring?.(0, 30), scheduledAt });
          if (!phone || !msgText || !scheduledAt) {
            console.log("[Background] ❌ Missing required fields");
            sendResponse({ success: false, error: "Missing phone, message or time" });
            return;
          }
          const data = await chrome.storage.local.get(["scheduledMessages"]);
          const messages = data.scheduledMessages || [];
          const newMessage = {
            id: `sm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            phone,
            contactName: contactName || phone,
            message: msgText,
            scheduledAt,
            status: "pending",
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          messages.push(newMessage);
          await chrome.storage.local.set({ scheduledMessages: messages });
          console.log("[Background] ✅ Scheduled message saved:", newMessage.id);
          sendResponse({ success: true, messageId: newMessage.id });
        } catch (error) {
          console.error("[Background] ❌ CREATE_SCHEDULED_MESSAGE error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "ARCHIVE_FLOW_BADGE":
    case "ARCHIVE_CAMPAIGN_BADGE":
      (async () => {
        try {
          const { sourceId, reason } = message.payload || {};
          if (!sourceId) {
            sendResponse({ success: false, error: "No sourceId provided" });
            return;
          }
          console.log("[Background] 🏷️ Archiving badges for sourceId:", sourceId, "reason:", reason);
          const result = await chrome.storage.local.get(["contactContexts"]);
          const contexts = result.contactContexts || {};
          let archivedCount = 0;
          const now = Date.now();
          for (const [phone, context] of Object.entries(contexts)) {
            if (context.activeBadge?.sourceId === sourceId) {
              const archivedBadge = {
                ...context.activeBadge,
                archivedAt: now,
                archiveReason: reason || (message.type === "ARCHIVE_FLOW_BADGE" ? "flow_stopped" : "campaign_completed")
              };
              context.badgeHistory = [archivedBadge, ...context.badgeHistory || []];
              context.activeBadge = null;
              archivedCount++;
            }
          }
          await chrome.storage.local.set({ contactContexts: contexts });
          console.log("[Background] ✅ Archived", archivedCount, "badges for sourceId:", sourceId);
          sendResponse({ success: true, archivedCount });
        } catch (error) {
          console.error("[Background] ❌ Archive badge error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "INIT_CONTACT_CONTEXT_SERVICE":
      (async () => {
        try {
          console.log("[Background] 🚀 Initializing ContactContextService...");
          const result = await chrome.storage.local.get(["contactContexts", "trackedMessages"]);
          const contexts = result.contactContexts || {};
          const trackedMessages = result.trackedMessages || [];
          if (Object.keys(contexts).length > 0 || trackedMessages.length === 0) {
            console.log("[Background] Migration not needed");
            sendResponse({ success: true, migrated: 0 });
            return;
          }
          console.log("[Background] Starting migration of", trackedMessages.length, "tracked messages...");
          sendResponse({ success: true, message: "Migration will be handled by ContactContextService" });
        } catch (error) {
          console.error("[Background] ❌ Init error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "CHECK_SUMMARY_LIMIT":
      (async () => {
        try {
          const storageData = await chrome.storage.local.get(["workspace", "realtimeUsage"]);
          const workspaceInfo = storageData.workspace || {};
          const usage = storageData.realtimeUsage || { aiReplies: 0, messagesSent: 0 };
          const planName = workspaceInfo.plan?.name || "Free";
          const plan = workspaceInfo.plan;
          const summaryLimitValue = plan?.aiRepliesPerDay || 10;
          const messageLimitValue = Math.min(plan?.messagesPerDay || 10, 50);
          console.log("[Background] 📊 Summary limit check:", usage.aiReplies, "/", summaryLimitValue, "(", planName, ")");
          sendResponse({
            success: true,
            limitExceeded: summaryLimitValue !== -1 && usage.aiReplies >= summaryLimitValue,
            used: usage.aiReplies,
            limit: summaryLimitValue,
            messageLimit: messageLimitValue,
            planName
          });
        } catch (error) {
          console.error("[Background] ❌ CHECK_SUMMARY_LIMIT error:", error);
          sendResponse({ success: false, limitExceeded: false, error: String(error) });
        }
      })();
      return true;
    case "GET_CHAT_MESSAGES_FOR_SUMMARY":
      (async () => {
        try {
          const { limit } = message.payload || { limit: 10 };
          console.log("[Background] 📨 Getting chat messages for summary (limit:", limit, ")");
          const waTab = await findWhatsAppTab();
          if (!waTab || !waTab.id) {
            sendResponse({ success: false, error: "WhatsApp Web not open", messages: [] });
            return;
          }
          try {
            const response = await chrome.tabs.sendMessage(waTab.id, {
              type: "GET_CURRENT_CHAT_MESSAGES",
              limit
            });
            if (response?.success) {
              sendResponse({ success: true, messages: response.messages });
            } else {
              sendResponse({ success: false, error: response?.error || "Failed to get messages", messages: [] });
            }
          } catch (tabError) {
            console.error("[Background] ❌ Error communicating with WhatsApp tab:", tabError);
            sendResponse({ success: false, error: "Cannot communicate with WhatsApp Web", messages: [] });
          }
        } catch (error) {
          console.error("[Background] ❌ GET_CHAT_MESSAGES_FOR_SUMMARY error:", error);
          sendResponse({ success: false, error: String(error), messages: [] });
        }
      })();
      return true;
    case "GENERATE_CHAT_SUMMARY":
      (async () => {
        try {
          const { messages } = message.payload || {};
          if (!messages || messages.length === 0) {
            sendResponse({ success: false, error: "No messages provided" });
            return;
          }
          console.log("[Background] 🤖 Generating chat summary for", messages.length, "messages");
          const storageData = await chrome.storage.local.get(["aiConfig"]);
          const aiConfig = storageData.aiConfig || {};
          const token = await getValidToken();
          if (!token) {
            sendResponse({ success: false, error: "Please sign in to SmartDM to generate summaries." });
            return;
          }
          const formattedMessages = messages.map(
            (m) => `${m.role === "me" ? "Me" : "Contact"}: ${m.text}`
          ).join("\n");
          const systemPrompt = `You are a helpful assistant that creates very concise chat summaries.
Summarize the entire conversation in 2-3 short sentences as a single paragraph. Do NOT use bullet points, lists, or headers. Just plain text.

IMPORTANT: Write the summary in the SAME language as the conversation.`;
          const userPrompt = `Please summarize this conversation:

${formattedMessages}`;
          console.log("[Background] Using SmartDM API for summary");
          const sumProxy = await proxyOpenAIChatCompletion({
            model: aiConfig.model || "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.5,
            max_completion_tokens: 500
          });
          if (!sumProxy.ok) {
            sendResponse({ success: false, error: sumProxy.error || "Failed to generate summary" });
            return;
          }
          const summary = sumProxy.data?.choices?.[0]?.message?.content?.trim?.() || "";
          if (!summary) {
            sendResponse({ success: false, error: "Failed to generate summary" });
            return;
          }
          console.log("[Background] ✅ Summary generated");
          sendResponse({ success: true, summary });
        } catch (error) {
          console.error("[Background] ❌ GENERATE_CHAT_SUMMARY error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "TRANSCRIBE_VOICE":
      (async () => {
        try {
          const { directPath, mediaKey, mimetype, messageId } = message.payload;
          console.log("[Background] 🎤 TRANSCRIBE_VOICE request");
          console.log("[Background]   - directPath:", directPath?.substring(0, 60) + "...");
          console.log("[Background]   - hasMediaKey:", !!mediaKey);
          console.log("[Background]   - mimetype:", mimetype);
          if (!directPath || !mediaKey) {
            sendResponse({ success: false, error: "Missing directPath or mediaKey" });
            return;
          }
          console.log("[Background] 🎤 Downloading encrypted audio...");
          const cdnUrl = `https://mmg.whatsapp.net${directPath}`;
          const audioResponse = await fetch(cdnUrl);
          if (!audioResponse.ok) {
            throw new Error(`CDN download failed: ${audioResponse.status} ${audioResponse.statusText}`);
          }
          const encryptedBuffer = await audioResponse.arrayBuffer();
          console.log("[Background] 🎤 Downloaded:", encryptedBuffer.byteLength, "bytes");
          console.log("[Background] 🎤 Decrypting audio...");
          const decryptedBuffer = await decryptWhatsAppAudio(encryptedBuffer, mediaKey);
          console.log("[Background] 🎤 Decrypted:", decryptedBuffer.byteLength, "bytes");
          console.log("[Background] 🎤 Sending to Whisper API...");
          const audioBlob = new Blob([decryptedBuffer], { type: "audio/ogg" });
          const formData = new FormData();
          formData.append("file", audioBlob, "voice.ogg");
          formData.append("model", "whisper-1");
          const whisperProxy = await proxyOpenAITranscription(formData);
          if (!whisperProxy.ok) {
            console.error("[Background] 🎤 Whisper API error:", whisperProxy.error);
            throw new Error(whisperProxy.error || "Whisper API error");
          }
          const transcription = whisperProxy.data?.text || "";
          console.log("[Background] 🎤 ✅ Transcription:", transcription.substring(0, 100));
          sendResponse({ success: true, text: transcription, messageId });
        } catch (error) {
          console.error("[Background] 🎤 ❌ TRANSCRIBE_VOICE error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "ANALYZE_IMAGE":
      (async () => {
        try {
          const { directPath, mediaKey, mimetype, messageId, caption } = message.payload;
          console.log("[Background] 🖼️ ANALYZE_IMAGE request");
          console.log("[Background]   - directPath:", directPath?.substring(0, 60) + "...");
          console.log("[Background]   - hasMediaKey:", !!mediaKey);
          console.log("[Background]   - mimetype:", mimetype);
          console.log("[Background]   - caption:", caption || "(none)");
          if (!directPath || !mediaKey) {
            sendResponse({ success: false, error: "Missing directPath or mediaKey" });
            return;
          }
          console.log("[Background] 🖼️ Downloading encrypted image...");
          const cdnUrl = `https://mmg.whatsapp.net${directPath}`;
          const imgResponse = await fetch(cdnUrl);
          if (!imgResponse.ok) {
            throw new Error(`CDN download failed: ${imgResponse.status} ${imgResponse.statusText}`);
          }
          const encryptedBuffer = await imgResponse.arrayBuffer();
          console.log("[Background] 🖼️ Downloaded:", encryptedBuffer.byteLength, "bytes");
          console.log("[Background] 🖼️ Decrypting image...");
          const decryptedBuffer = await decryptWhatsAppImage(encryptedBuffer, mediaKey);
          console.log("[Background] 🖼️ Decrypted:", decryptedBuffer.byteLength, "bytes");
          const bytes = new Uint8Array(decryptedBuffer);
          let binary = "";
          const chunkSize = 8192;
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            for (let j = 0; j < chunk.length; j++) {
              binary += String.fromCharCode(chunk[j]);
            }
          }
          const base64Image = btoa(binary);
          const imageDataUrl = `data:${mimetype || "image/jpeg"};base64,${base64Image}`;
          console.log("[Background] 🖼️ Image converted to base64, length:", base64Image.length);
          console.log("[Background] 🖼️ Sending to OpenAI Vision API...");
          const userContent = [];
          if (caption) {
            userContent.push({
              type: "text",
              text: `The user sent this image with the following caption: "${caption}"

Please describe what's in this image in detail and consider the caption context.`
            });
          } else {
            userContent.push({
              type: "text",
              text: "The user sent this image. Please describe what's in this image in detail — what objects, people, text, or information does it contain?"
            });
          }
          userContent.push({
            type: "image_url",
            image_url: {
              url: imageDataUrl,
              detail: "auto"
            }
          });
          const visionProxy = await proxyOpenAIChatCompletion({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant that analyzes images. Provide a clear, concise description of the image content. If there is text in the image, transcribe it. If the image contains a question or request, identify it. Respond in the same language as the caption if provided, otherwise respond in Russian."
              },
              {
                role: "user",
                content: userContent
              }
            ],
            max_completion_tokens: 500
          });
          if (!visionProxy.ok) {
            console.error("[Background] 🖼️ Vision API error:", visionProxy.error);
            throw new Error(visionProxy.error || "Vision API error");
          }
          const description = visionProxy.data?.choices?.[0]?.message?.content?.trim() || "";
          console.log("[Background] 🖼️ ✅ Image description:", description.substring(0, 150));
          sendResponse({ success: true, description, messageId, caption });
        } catch (error) {
          console.error("[Background] 🖼️ ❌ ANALYZE_IMAGE error:", error);
          sendResponse({ success: false, error: String(error) });
        }
      })();
      return true;
    case "GET_ALL_CRM_CONTACTS":
      (async () => {
        try {
          console.log("[Background] 📦 GET_ALL_CRM_CONTACTS: Fetching all contacts for cache");
          const db = await openCrmDb();
          try {
            const contacts = await readAllFromStore(db, "contacts");
            console.log("[Background] ✅ Loaded", contacts.length, "contacts for cache");
            sendResponse({
              success: true,
              contacts: contacts.map((c) => ({
                id: c.id,
                phoneNumber: c.phoneNumber,
                name: c.name,
                status: c.status,
                tags: c.tags,
                notes: c.notes,
                lastMessageDate: c.lastMessageDate instanceof Date ? c.lastMessageDate.toISOString() : String(c.lastMessageDate || ""),
                createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
                updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : String(c.updatedAt),
                customFields: c.customFields
              }))
            });
          } finally {
            db?.close();
          }
        } catch (error) {
          console.error("[Background] ❌ GET_ALL_CRM_CONTACTS error:", error);
          sendResponse({ success: false, error: String(error), contacts: [] });
        }
      })();
      return true;
    case "GET_CONTACT_BY_PHONE":
      (async () => {
        try {
          const { phone } = message.payload || {};
          console.log("[Background] 📞 GET_CONTACT_BY_PHONE:", phone);
          if (!phone) {
            sendResponse({ success: false, error: "No phone provided", contact: null });
            return;
          }
          const contact = await findContactByPhone(phone);
          if (contact) {
            sendResponse({
              success: true,
              contact: {
                id: contact.id,
                phoneNumber: contact.phoneNumber,
                name: contact.name,
                status: contact.status,
                tags: contact.tags,
                notes: contact.notes,
                lastMessageDate: contact.lastMessageDate instanceof Date ? contact.lastMessageDate.toISOString() : String(contact.lastMessageDate || ""),
                createdAt: contact.createdAt instanceof Date ? contact.createdAt.toISOString() : String(contact.createdAt),
                updatedAt: contact.updatedAt instanceof Date ? contact.updatedAt.toISOString() : String(contact.updatedAt),
                customFields: contact.customFields
              }
            });
          } else {
            sendResponse({ success: true, contact: null });
          }
        } catch (error) {
          console.error("[Background] ❌ GET_CONTACT_BY_PHONE error:", error);
          sendResponse({ success: false, error: String(error), contact: null });
        }
      })();
      return true;
    case "GET_CONTACT_BY_NAME":
      (async () => {
        try {
          const { name } = message.payload || {};
          console.log("[Background] 👤 GET_CONTACT_BY_NAME:", name);
          if (!name) {
            sendResponse({ success: false, error: "No name provided", contact: null });
            return;
          }
          const db = await openCrmDb();
          try {
            const contacts = await readAllFromStore(db, "contacts");
            let contact = contacts.find((c) => c.name === name);
            if (!contact) {
              const nameLower = name.toLowerCase();
              contact = contacts.find((c) => c.name?.toLowerCase() === nameLower);
            }
            if (contact) {
              console.log("[Background] ✅ Found contact by name:", contact.phoneNumber);
              sendResponse({
                success: true,
                contact: {
                  id: contact.id,
                  phoneNumber: contact.phoneNumber,
                  name: contact.name,
                  status: contact.status,
                  tags: contact.tags,
                  notes: contact.notes,
                  lastMessageDate: contact.lastMessageDate instanceof Date ? contact.lastMessageDate.toISOString() : String(contact.lastMessageDate || ""),
                  createdAt: contact.createdAt instanceof Date ? contact.createdAt.toISOString() : String(contact.createdAt),
                  updatedAt: contact.updatedAt instanceof Date ? contact.updatedAt.toISOString() : String(contact.updatedAt),
                  customFields: contact.customFields
                }
              });
            } else {
              console.log("[Background] ❌ No contact found by name:", name);
              sendResponse({ success: true, contact: null });
            }
          } finally {
            db?.close();
          }
        } catch (error) {
          console.error("[Background] ❌ GET_CONTACT_BY_NAME error:", error);
          sendResponse({ success: false, error: String(error), contact: null });
        }
      })();
      return true;
    case "GET_ACCOUNT_OWNER":
      (async () => {
        try {
          const owner = await getAccountOwnerContact();
          sendResponse({ success: true, owner });
        } catch (err) {
          sendResponse({ success: false, owner: null, error: String(err) });
        }
      })();
      return true;
    case "CRM_LIST_CONTACTS":
      (async () => {
        try {
          const { search, status, tag, limit } = message.payload || {};
          const db = await openCrmDb();
          try {
            let contacts = await readAllFromStore(db, "contacts");
            if (search) {
              const q = String(search).toLowerCase();
              contacts = contacts.filter(
                (c) => c.name?.toLowerCase().includes(q) || c.phoneNumber?.includes(search) || c.notes?.toLowerCase().includes(q)
              );
            }
            if (status) contacts = contacts.filter((c) => c.status === status);
            if (tag) contacts = contacts.filter((c) => Array.isArray(c.tags) && c.tags.includes(tag));
            if (limit) contacts = contacts.slice(0, Number(limit));
            sendResponse({
              success: true,
              contacts: contacts.map((c) => ({
                id: c.id,
                name: c.name,
                phoneNumber: c.phoneNumber,
                status: c.status,
                tags: c.tags,
                notes: c.notes,
                lastMessageDate: c.lastMessageDate instanceof Date ? c.lastMessageDate.toISOString() : c.lastMessageDate || null,
                customFields: c.customFields
              })),
              total: contacts.length
            });
          } finally {
            db?.close();
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err), contacts: [] });
        }
      })();
      return true;
    case "CRM_GET_CONTACT":
      (async () => {
        try {
          const { phone, name, id } = message.payload || {};
          let contact;
          if (id) contact = await getContactById(Number(id));
          else if (phone) contact = await findContactByPhone(phone);
          else if (name) {
            const db = await openCrmDb();
            try {
              const all = await readAllFromStore(db, "contacts");
              contact = all.find((c) => c.name?.toLowerCase() === String(name).toLowerCase());
            } finally {
              db?.close();
            }
          }
          if (!contact) {
            sendResponse({ success: false, error: "Contact not found", contact: null });
          } else {
            const data = await getFullContactData(contact.phoneNumber, contact.name);
            sendResponse({ success: true, contact: { ...contact }, fullData: data });
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err), contact: null });
        }
      })();
      return true;
    case "CRM_CREATE_CONTACT":
      (async () => {
        try {
          const { phone, name } = message.payload || {};
          if (!phone || !name) {
            sendResponse({ success: false, error: "phone and name are required" });
            return;
          }
          const id = await createContact(phone, name);
          sendResponse({ success: !!id, contactId: id });
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_UPDATE_CONTACT":
      (async () => {
        try {
          const { phone, status, tags, notes, customFields } = message.payload || {};
          if (!phone) {
            sendResponse({ success: false, error: "phone is required" });
            return;
          }
          const normalizedCustomFields = customFields && typeof customFields === "object" ? normalizeObjectDates(customFields) : void 0;
          const ok = await updateContactByPhone(phone, { status, tags, notes, customFields: normalizedCustomFields });
          sendResponse({ success: ok });
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_LIST_DATA_FIELDS":
      (async () => {
        try {
          const config = await getContactFieldsConfig();
          sendResponse({
            success: true,
            fields: config?.fields ?? [],
            updatedAt: config?.updatedAt
          });
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_ADD_DATA_FIELD":
      (async () => {
        try {
          const { name, label, type, required, options } = message.payload || {};
          if (!label && !name) {
            sendResponse({ success: false, error: "label or name is required" });
            return;
          }
          const result = await addContactField({ name, label, type, required, options });
          sendResponse(result);
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_LIST_CUSTOM_TABLES":
      (async () => {
        try {
          const schemas = await getCustomSchemasList();
          sendResponse({
            success: true,
            tables: schemas.map((s) => ({
              id: s.id,
              name: s.name,
              label: s.label,
              fields: s.fields,
              createdAt: s.createdAt
            }))
          });
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_CREATE_CUSTOM_TABLE":
      (async () => {
        try {
          const { name, label, fields } = message.payload || {};
          if (!name && !label) {
            sendResponse({ success: false, error: "name or label is required" });
            return;
          }
          const result = await addCustomSchema({
            name: name || label,
            label: label || name,
            fields: Array.isArray(fields) ? fields : []
          });
          sendResponse(result);
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_ADD_CUSTOM_RECORD":
      (async () => {
        try {
          const { phone, contactId, schemaId, data } = message.payload || {};
          let cid;
          if (contactId != null) {
            cid = Number(contactId);
          } else if (phone) {
            const contact = await findContactByPhone(phone);
            cid = contact?.id;
          }
          if (cid == null) {
            sendResponse({ success: false, error: "contact not found: provide phone or contactId" });
            return;
          }
          if (!schemaId) {
            sendResponse({ success: false, error: "schemaId is required" });
            return;
          }
          const normalizedData = data && typeof data === "object" ? normalizeObjectDates(data) : {};
          const result = await addCustomRecord({ contactId: cid, schemaId, data: normalizedData });
          sendResponse(result);
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_LIST_CAMPAIGNS":
      (async () => {
        try {
          const { status: filterStatus, limit } = message.payload || {};
          const db = await openCrmDb();
          try {
            let campaigns = await readAllFromStore(db, "campaigns");
            if (filterStatus) {
              if (filterStatus === "active") {
                campaigns = campaigns.filter((c) => c.status === "active" || c.status === "running");
              } else {
                campaigns = campaigns.filter((c) => c.status === filterStatus);
              }
            }
            campaigns = campaigns.sort((a, b) => {
              const ta = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt || 0).getTime();
              const tb = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt || 0).getTime();
              return tb - ta;
            });
            if (limit) campaigns = campaigns.slice(0, Number(limit));
            sendResponse({
              success: true,
              campaigns: campaigns.map((c) => ({
                id: c.id,
                name: c.name,
                status: c.status,
                messageTemplate: c.messageTemplate,
                campaignGoal: c.campaignGoal,
                createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt || null,
                stats: c.stats,
                recipientsCount: Array.isArray(c.recipients) ? c.recipients.length : c.targetPhones?.length || 0
              })),
              total: campaigns.length
            });
          } finally {
            db?.close();
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err), campaigns: [] });
        }
      })();
      return true;
    case "CRM_GET_CAMPAIGN":
      (async () => {
        try {
          const { id } = message.payload || {};
          if (!id) {
            sendResponse({ success: false, error: "id is required" });
            return;
          }
          const db = await openCrmDb();
          try {
            const all = await readAllFromStore(db, "campaigns");
            const campaign = all.find((c) => String(c.id) === String(id));
            if (!campaign) {
              sendResponse({ success: false, error: "Campaign not found" });
            } else {
              sendResponse({ success: true, campaign });
            }
          } finally {
            db?.close();
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_CREATE_CAMPAIGN":
      (async () => {
        try {
          const payload = message.payload || {};
          const { name, messageTemplate, campaignGoal, recipientPhones, recipientNames, startNow } = payload;
          if (!name || !messageTemplate) {
            sendResponse({ success: false, error: "name and messageTemplate are required" });
            return;
          }
          const result = await createCampaign({
            name: String(name).trim(),
            messageTemplate: String(messageTemplate).trim(),
            campaignGoal: campaignGoal != null ? String(campaignGoal).trim() : void 0,
            recipientPhones: Array.isArray(recipientPhones) ? recipientPhones.map(String) : void 0,
            recipientNames: Array.isArray(recipientNames) ? recipientNames.map(String) : void 0,
            startNow: !!startNow
          });
          if ("error" in result) {
            sendResponse({ success: false, error: result.error });
          } else {
            sendResponse({ success: true, id: result.id });
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_START_CAMPAIGN":
      (async () => {
        try {
          const payload = message.payload || {};
          const { id: campaignId, name: campaignName } = payload;
          const result = await startCampaignByIdOrName({
            id: campaignId != null ? Number(campaignId) : void 0,
            name: campaignName != null ? String(campaignName).trim() : void 0
          });
          if ("error" in result) {
            sendResponse({ success: false, error: result.error });
            return;
          }
          const campaign = result.campaign;
          sendResponse({ success: true, campaignId: campaign.id, message: "Campaign started" });
          const tab = await findWhatsAppTab();
          if (!tab?.id || !campaign.recipients?.length) return;
          const minDelay = campaign.settings?.minDelay ?? 3e3;
          const maxDelay = campaign.settings?.maxDelay ?? 6e3;
          const delay = () => new Promise((r) => setTimeout(r, minDelay + Math.random() * (maxDelay - minDelay)));
          const campaignGoal = campaign.campaignGoal || campaign.settings?.gptSystemMessage || "";
          for (const r of campaign.recipients) {
            if (r.status !== "pending") continue;
            let content = campaign.messageTemplate || "";
            const nameVal = r.name || r.phoneNumber || "";
            content = content.replace(/\[name\]/gi, nameVal).replace(/\[phone\]/gi, r.phoneNumber || "");
            if (r.variables && typeof r.variables === "object") {
              for (const [k, v] of Object.entries(r.variables)) {
                content = content.replace(new RegExp(`\\[${k}\\]`, "gi"), String(v));
              }
            }
            try {
              await chrome.tabs.sendMessage(tab.id, {
                type: "SEND_CAMPAIGN_MESSAGE",
                payload: {
                  phoneNumber: r.phoneNumber,
                  content,
                  contactName: r.name,
                  campaignId: campaign.id,
                  campaignName: campaign.name,
                  campaignGoal,
                  botAgentId: campaign.botAgentId,
                  gptSystemMessage: campaign.settings?.gptSystemMessage
                }
              });
              await updateCampaignRecipientStatus(campaign.id, r.phoneNumber, "sent");
            } catch (e) {
              await updateCampaignRecipientStatus(campaign.id, r.phoneNumber, "failed", e.message);
            }
            await delay();
          }
          const updated = await getCampaignById(campaign.id);
          if (updated) {
            const sent = updated.stats?.sent ?? 0;
            const failed = updated.stats?.failed ?? 0;
            await pushToAppNotificationFeed("campaign_complete", "Campaign Sending Complete", `"${updated.name}" finished: ${sent} sent, ${failed} failed`);
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_CREATE_FLOW":
      (async () => {
        try {
          const payload = message.payload || {};
          const {
            name,
            messageTemplate,
            description,
            goal,
            triggerType,
            triggerEventType,
            moduleId,
            moduleEventId,
            waitBeforeMessage,
            isActive
          } = payload;
          if (!name || !messageTemplate) {
            sendResponse({ success: false, error: "name and messageTemplate are required" });
            return;
          }
          const result = await createFlow({
            name: String(name).trim(),
            messageTemplate: String(messageTemplate).trim(),
            description: description != null ? String(description).trim() : void 0,
            goal: goal != null ? String(goal).trim() : void 0,
            triggerType: triggerType === "module_event" ? "module_event" : "event",
            triggerEventType: triggerType === "module_event" ? void 0 : ["contact_added", "tag_added", "custom_record_added", "message_received"].includes(triggerEventType) ? triggerEventType : "contact_added",
            moduleId: moduleId != null ? String(moduleId).trim() : void 0,
            moduleEventId: moduleEventId != null ? String(moduleEventId).trim() : void 0,
            waitBeforeMessage: waitBeforeMessage && typeof waitBeforeMessage.duration === "number" && waitBeforeMessage.unit ? {
              duration: Number(waitBeforeMessage.duration),
              unit: ["minutes", "hours", "days"].includes(waitBeforeMessage.unit) ? waitBeforeMessage.unit : "days"
            } : void 0,
            isActive: isActive !== false
          });
          if ("error" in result) {
            sendResponse({ success: false, error: result.error });
          } else {
            sendResponse({ success: true, id: result.id });
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_LIST_FLOWS":
      (async () => {
        try {
          const db = await openCrmDb();
          try {
            const flows = await readAllFromStore(db, "flows");
            sendResponse({
              success: true,
              flows: flows.map((f) => ({
                id: f.id,
                name: f.name,
                isActive: f.isActive,
                enabled: f.enabled,
                description: f.description || "",
                goal: f.goal || "",
                triggerType: f.trigger?.type || f.triggerType || "",
                stepsCount: Array.isArray(f.steps) ? f.steps.length : 0,
                createdAt: f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt || null,
                stats: f.stats
              })),
              total: flows.length
            });
          } finally {
            db?.close();
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err), flows: [] });
        }
      })();
      return true;
    case "CRM_GET_FLOW":
      (async () => {
        try {
          const { id } = message.payload || {};
          if (!id) {
            sendResponse({ success: false, error: "id is required" });
            return;
          }
          const db = await openCrmDb();
          try {
            const flows = await readAllFromStore(db, "flows");
            const flow = flows.find((f) => String(f.id) === String(id));
            sendResponse(flow ? { success: true, flow } : { success: false, error: "Flow not found" });
          } finally {
            db?.close();
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_GET_FLOW_EXECUTIONS":
      (async () => {
        try {
          const { flowId, contactId, status: filterStatus, limit } = message.payload || {};
          const db = await openCrmDb();
          try {
            let execs = await readAllFromStore(db, "flowExecutions");
            if (flowId) execs = execs.filter((e) => String(e.flowId) === String(flowId));
            if (contactId) execs = execs.filter((e) => String(e.contactId) === String(contactId));
            if (filterStatus) execs = execs.filter((e) => e.status === filterStatus);
            execs = execs.sort((a, b) => {
              const ta = a.startedAt instanceof Date ? a.startedAt.getTime() : new Date(a.startedAt || 0).getTime();
              const tb = b.startedAt instanceof Date ? b.startedAt.getTime() : new Date(b.startedAt || 0).getTime();
              return tb - ta;
            });
            if (limit) execs = execs.slice(0, Number(limit));
            sendResponse({ success: true, executions: execs, total: execs.length });
          } finally {
            db?.close();
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err), executions: [] });
        }
      })();
      return true;
    case "CRM_START_FLOW":
      (async () => {
        try {
          const { flowId, phone, contactName } = message.payload || {};
          if (!flowId || !phone) {
            sendResponse({ success: false, error: "flowId and phone are required" });
            return;
          }
          const contact = await findContactByPhone(phone);
          if (!contact?.id) {
            sendResponse({ success: false, error: "Contact not found for phone: " + phone });
            return;
          }
          const execId = await createFlowExecution(flowId, contact.id, contactName || contact.name);
          sendResponse({ success: !!execId, executionId: execId });
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_LIST_TEMPLATES":
      (async () => {
        try {
          const templates = await getTemplates();
          sendResponse({ success: true, templates, total: templates.length });
        } catch (err) {
          sendResponse({ success: false, error: String(err), templates: [] });
        }
      })();
      return true;
    case "CRM_CREATE_TEMPLATE":
      (async () => {
        try {
          const { title, content, category, shortcut } = message.payload || {};
          if (!title || !content) {
            sendResponse({ success: false, error: "title and content are required" });
            return;
          }
          const id = await addTemplate({ title, content, category, shortcut });
          sendResponse({ success: !!id, templateId: id });
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_GET_STATS":
      (async () => {
        try {
          const db = await openCrmDb();
          try {
            const [contacts, campaigns, flows, flowExecs, messages] = await Promise.all([
              readAllFromStore(db, "contacts"),
              readAllFromStore(db, "campaigns"),
              readAllFromStore(db, "flows"),
              readAllFromStore(db, "flowExecutions"),
              readAllFromStore(db, "messages")
            ]);
            const activeFlows = flows.filter((f) => f.isActive);
            const runningExecs = flowExecs.filter((e) => e.status === "running" || e.status === "pending");
            const today = /* @__PURE__ */ new Date();
            today.setHours(0, 0, 0, 0);
            const todayMessages = messages.filter((m) => {
              const ts = m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp || 0);
              return ts >= today;
            });
            const activeCampaigns = campaigns.filter((c) => c.status === "running" || c.status === "active");
            sendResponse({
              success: true,
              stats: {
                totalContacts: contacts.length,
                totalCampaigns: campaigns.length,
                activeCampaigns: activeCampaigns.length,
                totalFlows: flows.length,
                activeFlows: activeFlows.length,
                runningFlowExecutions: runningExecs.length,
                totalFlowExecutions: flowExecs.length,
                totalMessages: messages.length,
                messagesToday: todayMessages.length
              }
            });
          } finally {
            db?.close();
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err) });
        }
      })();
      return true;
    case "CRM_GET_CONTACT_MESSAGES":
      (async () => {
        try {
          const { phone, limit } = message.payload || {};
          if (!phone) {
            sendResponse({ success: false, error: "phone is required", messages: [] });
            return;
          }
          const contact = await findContactByPhone(phone);
          if (!contact?.id) {
            sendResponse({ success: true, messages: [], total: 0 });
            return;
          }
          const db = await openCrmDb();
          try {
            const allMessages = await readAllFromStore(db, "messages");
            let msgs = allMessages.filter((m) => m.contactId === contact.id);
            msgs = msgs.sort((a, b) => {
              const ta = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp || 0).getTime();
              const tb = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp || 0).getTime();
              return tb - ta;
            });
            if (limit) msgs = msgs.slice(0, Number(limit));
            sendResponse({
              success: true,
              messages: msgs.map((m) => ({
                id: m.id,
                content: m.content,
                direction: m.direction,
                timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp || null,
                isAIGenerated: m.isAIGenerated
              })),
              total: msgs.length
            });
          } finally {
            db?.close();
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err), messages: [] });
        }
      })();
      return true;
    case "CRM_LIST_SCHEDULED_MESSAGES":
      (async () => {
        try {
          const { phone, status: filterStatus, limit } = message.payload || {};
          const db = await openCrmDb();
          try {
            let msgs = await readAllFromStore(db, "scheduledMessages");
            if (phone) {
              const suffix = phone.replace(/\D/g, "").slice(-9);
              msgs = msgs.filter((m) => {
                const mSuffix = String(m.contactPhone || "").replace(/\D/g, "").slice(-9);
                return mSuffix === suffix;
              });
            }
            if (filterStatus) msgs = msgs.filter((m) => m.status === filterStatus);
            msgs = msgs.sort((a, b) => {
              const ta = a.scheduledAt instanceof Date ? a.scheduledAt.getTime() : new Date(a.scheduledAt || 0).getTime();
              const tb = b.scheduledAt instanceof Date ? b.scheduledAt.getTime() : new Date(b.scheduledAt || 0).getTime();
              return ta - tb;
            });
            if (limit) msgs = msgs.slice(0, Number(limit));
            sendResponse({
              success: true,
              scheduledMessages: msgs.map((m) => ({
                id: m.id,
                contactPhone: m.contactPhone,
                message: m.message,
                status: m.status,
                scheduledAt: m.scheduledAt instanceof Date ? m.scheduledAt.toISOString() : m.scheduledAt || null
              })),
              total: msgs.length
            });
          } finally {
            db?.close();
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err), scheduledMessages: [] });
        }
      })();
      return true;
    case "CRM_LIST_KNOWLEDGE_BASE":
      (async () => {
        try {
          const db = await openCrmDb();
          try {
            const items = await readAllFromStore(db, "knowledgeBase");
            sendResponse({
              success: true,
              items: items.map((item) => ({
                id: item.id,
                type: item.type,
                title: item.title || "",
                content: (item.content || "").substring(0, 500),
                createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt || null
              })),
              total: items.length
            });
          } finally {
            db?.close();
          }
        } catch (err) {
          sendResponse({ success: false, error: String(err), items: [] });
        }
      })();
      return true;
    default:
      sendResponse({ error: "Unknown message type" });
  }
  return true;
});
chrome.alarms.create("keepAlive", { periodInMinutes: 0.5 });
chrome.alarms.create("flowConditionCheck", { periodInMinutes: 1 });
chrome.alarms.create("calendarNotificationCheck", { periodInMinutes: 1 });
chrome.alarms.create("flushPendingSyncs", { periodInMinutes: 2 });
chrome.alarms.create("extensionVersionCheck", { periodInMinutes: 24 * 60 });
chrome.alarms.create("platformAiDefaults", { periodInMinutes: 15 });
void syncPlatformAiDefaultsIntoStorage();
checkExtensionUpdate(true);
processCalendarNotificationsInBackground().catch((error) => {
  console.warn("[Background] Initial calendar notification check failed:", error);
});
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "keepAlive") return;
  if (alarm.name === "flushPendingSyncs") {
    flushPendingSyncs();
    return;
  }
  if (alarm.name === "extensionVersionCheck") {
    checkExtensionUpdate(true);
    return;
  }
  if (alarm.name === "platformAiDefaults") {
    void syncPlatformAiDefaultsIntoStorage();
    return;
  }
  if (alarm.name === "calendarNotificationCheck") {
    await processCalendarNotificationsInBackground();
    return;
  }
  if (alarm.name === "flowConditionCheck") {
    console.log("[Background] ⏰ Checking flow conditions...");
    try {
      const crmTabsFlow = await chrome.tabs.query({ url: chrome.runtime.getURL("*") });
      for (const tab of crmTabsFlow) {
        if (tab.id) {
          try {
            await chrome.tabs.sendMessage(tab.id, { type: "CHECK_FLOW_CONDITIONS" });
            console.log("[Background] Sent CHECK_FLOW_CONDITIONS to tab:", tab.id);
          } catch (e) {
          }
        }
      }
    } catch (error) {
      console.error("[Background] Error checking flow conditions:", error);
    }
    return;
  }
  if (alarm.name.startsWith("flow-execution-")) {
    const executionId = parseInt(alarm.name.replace("flow-execution-", ""));
    console.log("[Background] ⏰ Flow execution alarm triggered:", executionId);
    try {
      const crmTabsExec = await chrome.tabs.query({ url: chrome.runtime.getURL("*") });
      for (const tab of crmTabsExec) {
        if (tab.id) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: "CONTINUE_FLOW_EXECUTION",
              executionId
            });
          } catch (e) {
          }
        }
      }
    } catch (error) {
      console.error("[Background] Error handling flow execution alarm:", error);
    }
    return;
  }
  if (alarm.name.startsWith("pending-flow-")) {
    const executionId = parseInt(alarm.name.replace("pending-flow-", ""));
    console.log("[Background] ⏰ Pending flow execution alarm triggered:", executionId);
    try {
      const crmTabsPending = await chrome.tabs.query({ url: chrome.runtime.getURL("*") });
      let notified = false;
      for (const tab of crmTabsPending) {
        if (tab.id) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: "START_PENDING_FLOW_EXECUTION",
              executionId
            });
            notified = true;
            console.log("[Background] ✅ Sent START_PENDING_FLOW_EXECUTION to tab:", tab.id);
          } catch (e) {
          }
        }
      }
      if (!notified) {
        console.log("[Background] ℹ️ No CRM tabs open, storing pending start request");
        const result = await chrome.storage.local.get(["pendingFlowStarts"]);
        const starts = result.pendingFlowStarts || [];
        starts.push({
          executionId,
          triggeredAt: Date.now()
        });
        await chrome.storage.local.set({ pendingFlowStarts: starts });
      }
      await pushToAppNotificationFeed("flow_started", "SmartDM Flow Started", "A scheduled flow is now running.");
      if (chrome.notifications) {
        chrome.notifications.create(`flow-started-${executionId}`, {
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "SmartDM Flow Started",
          message: "A scheduled flow is now running.",
          priority: 2
        });
      }
    } catch (error) {
      console.error("[Background] Error handling pending flow alarm:", error);
    }
    return;
  }
  if (alarm.name.startsWith("campaign-")) {
    const campaignId = alarm.name.replace("campaign-", "");
    console.log("[Background] ⏰ Scheduled campaign alarm triggered:", campaignId);
    try {
      const result = await chrome.storage.local.get(["scheduledCampaignStarts"]);
      const starts = result.scheduledCampaignStarts || [];
      starts.push({
        campaignId,
        triggeredAt: Date.now()
      });
      await chrome.storage.local.set({ scheduledCampaignStarts: starts });
      console.log("[Background] 📋 Campaign start scheduled:", campaignId);
      await pushToAppNotificationFeed("campaign_started", "SmartDM Campaign Started", "A scheduled campaign has started sending messages.");
      const crmTabs = await chrome.tabs.query({ url: chrome.runtime.getURL("*") });
      for (const tab of crmTabs) {
        if (tab.id) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: "START_SCHEDULED_CAMPAIGN",
              campaignId
            });
          } catch (e) {
          }
        }
      }
      if (chrome.notifications) {
        chrome.notifications.create(`campaign-started-${campaignId}`, {
          type: "basic",
          iconUrl: "icons/icon128.png",
          title: "SmartDM Campaign Started",
          message: "A scheduled campaign has started sending messages.",
          priority: 2
        });
      }
    } catch (error) {
      console.error("[Background] Error handling campaign alarm:", error);
    }
  }
});
async function decryptWhatsAppMedia(encBuffer, mediaKeyB64, mediaType) {
  const infoStrings = {
    audio: "WhatsApp Audio Keys",
    image: "WhatsApp Image Keys"
  };
  const mediaKeyStr = atob(mediaKeyB64);
  const mediaKey = new Uint8Array(mediaKeyStr.length);
  for (let i = 0; i < mediaKeyStr.length; i++) {
    mediaKey[i] = mediaKeyStr.charCodeAt(i);
  }
  const salt = new Uint8Array(32);
  const info = new TextEncoder().encode(infoStrings[mediaType]);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    mediaKey,
    { name: "HKDF" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info },
    keyMaterial,
    112 * 8
  );
  const derived = new Uint8Array(derivedBits);
  const iv = derived.slice(0, 16);
  const cipherKey = derived.slice(16, 48);
  const encData = new Uint8Array(encBuffer, 0, encBuffer.byteLength - 10);
  const aesKey = await crypto.subtle.importKey(
    "raw",
    cipherKey,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );
  return crypto.subtle.decrypt({ name: "AES-CBC", iv }, aesKey, encData);
}
async function decryptWhatsAppImage(encBuffer, mediaKeyB64) {
  return decryptWhatsAppMedia(encBuffer, mediaKeyB64, "image");
}
async function decryptWhatsAppAudio(encBuffer, mediaKeyB64) {
  const mediaKeyStr = atob(mediaKeyB64);
  const mediaKey = new Uint8Array(mediaKeyStr.length);
  for (let i = 0; i < mediaKeyStr.length; i++) {
    mediaKey[i] = mediaKeyStr.charCodeAt(i);
  }
  const salt = new Uint8Array(32);
  const info = new TextEncoder().encode("WhatsApp Audio Keys");
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    mediaKey,
    { name: "HKDF" },
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt,
      info
    },
    keyMaterial,
    112 * 8
    // bits
  );
  const derived = new Uint8Array(derivedBits);
  const iv = derived.slice(0, 16);
  const cipherKey = derived.slice(16, 48);
  const encData = new Uint8Array(encBuffer, 0, encBuffer.byteLength - 10);
  const aesKey = await crypto.subtle.importKey(
    "raw",
    cipherKey,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    aesKey,
    encData
  );
  return decrypted;
}
