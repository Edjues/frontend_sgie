import { toNodeHandler } from "better-auth/node";
import { auth } from "../../../lib/auth";

export const config = {
  api: {
    bodyParser: false, 
    externalResolver: true,
  },
};

export default toNodeHandler(auth);
