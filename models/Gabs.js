var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;


var gabSchema = new Schema({
    gabs: { type: String, required: true, },
    author: ObjectId,
    created_at: Date,
    like: [ObjectId]
});

gabSchema.pre("save", function(next) {

    // new gab gets current created at day
    if (!this.created_at) this.created_at = new Date();

    next();
});


module.exports = mongoose.model('gab', gabSchema);