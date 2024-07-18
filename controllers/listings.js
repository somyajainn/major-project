const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
	const allListings = await Listing.find({});
	res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
	res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
	let { id } = req.params;
	const listing = await Listing.findById(id)
		.populate({
			path: "reviews",
			populate: {
				path: "author",
			},
		})
		.populate("owner");
	if (!listing) {
		req.flash("error", "Listing you requested for doesn't exists");
		return res.redirect("/listings");
	}
	console.log(listing);
	res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
	console.log("Start creating listing");
	try {
		if (!req.file) {
			req.flash("error", "Image upload required");
			return res.redirect("/listings/new");
		}

		let url = req.file.path;
		let filename = req.file.filename;

		const newListing = new Listing(req.body.listing);
		newListing.owner = req.user._id;
		newListing.image = { url, filename };
		await newListing.save();

		req.flash("success", "New listing Created!");
		return res.redirect("/listings");
	} catch (err) {
		console.error(err); // Log the error
		return next(err);
	}
};

module.exports.renderEditForm = async (req, res) => {
	let { id } = req.params;
	const listing = await Listing.findById(id);
	if (!listing) {
		req.flash("error", "Listing you requested for doesn't exists");
		return res.redirect("/listings");
	}

	let originalImageUrl = listing.image.url;
	originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_20,w_20");
	res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListings = async (req, res) => {
	let { id } = req.params;
	try {
		let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
		if (typeof req.file !== "undefined") {
			let url = req.file.path;
			let filename = req.file.filename;
			listing.image = { url, filename };
			await listing.save();
		}
		req.flash("success", "Listing Updated!");
		return res.redirect(`/listings/${id}`);
	} catch (err) {
		console.error(err);
		req.flash("error", "Error updating listing");
		return res.redirect("/listings");
	}
};

module.exports.destroyListing = async (req, res) => {
	let { id } = req.params;
	try {
		await Listing.findByIdAndDelete(id);
		req.flash("success", "Listing Deleted");
		return res.redirect("/listings");
	} catch (err) {
		console.error(err);
		req.flash("error", "Error deleting listing");
		return res.redirect("/listings");
	}
};
