// A number of useful Ramda function pipes
import { flatten, isNil, pipe, reject } from "ramda";

export const flattenWithNullsRemoved = pipe(flatten, reject(isNil));