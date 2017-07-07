var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var gabSchema = new Schema({
    gabs: { type: String, required: true, },
    author: { type: ObjectId, ref: "User", required: true },
    likes: [String],
    created_at: Date,
});

gabSchema.pre("save", function(next) {
    // new poem gets current created at day
    if (!this.created_at) this.created_at = new Date();

    next();
});


module.exports = mongoose.model('gabs', gabSchema);