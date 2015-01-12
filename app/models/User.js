'use strict';

var UserSchema = new mongoose.Schema(
    {
        name: String,
        pwd: String
    },
    { collection: 'User' }
);
