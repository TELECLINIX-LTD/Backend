import config from "./config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import Routes from "./routes/index";
import ErrorHandler from "./middlewears/error_handler.middlewear";
const app = express();

app.use(morgan("dev"));
app.use(cors(config.CORS_OPTION));
Routes(app);
app.use(ErrorHandler);

try {
	app.listen(config.PORT, () => {
		console.log("Server listening on PORT", config.PORT);
	});
} catch (error: any) {
	console.error("An error occured while trying to run the server", error);
}
