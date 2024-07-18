const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
	.then(() => {
		console.log("Connected to DB");
	})
	.catch((err) => {
		console.log(err);
	});

async function main() {
	await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
	try {
		await Listing.deleteMany({});
		initData.data = initData.data.map((obj) => ({
			...obj,
			owner: "66962ab765bb9751051b8855",
		}));
		await Listing.insertMany(initData.data);
		console.log("data was initialized");
	} catch (err) {
		console.error("Error initializing data", err);
	}
};

initDB();
