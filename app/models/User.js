'use strict';

var userSchema = new mongoose.Schema(
    {
        name: String,
        pwd: String
    },
    { collection: 'User' }
);
