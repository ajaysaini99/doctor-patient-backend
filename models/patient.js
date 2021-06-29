const mongoose = require( 'mongoose' );
const bcrypt = require( 'bcrypt' );

const patientSchema = new mongoose.Schema( {
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        
        required : true
    },
    role : {
        type : String,
        required : true
    }
}  )

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

patientSchema.path( 'email' ).validate(
    email => emailRegex.test( email ),
    'Invalid email id format'
);

patientSchema.path( 'password' ).validate( 
    password => passwordRegex.test( password ),
    'Invalid password format - Password must contain at least 1 lowercase letter, 1 uppercase letter, 1 numeric character, and one special character'
);

const SALT_FACTOR = 10;

patientSchema.pre( 'save', function( done ) {

    const user = this;

    
    if( !user.isModified( 'password' ) ) {
        return done();
    }

    
    bcrypt.genSalt( SALT_FACTOR, ( err, salt ) => {
        if( err ) {
            return done( err );
        }

        bcrypt.hash( user.password, salt, ( err, hashedPassword ) => {
            if( err ) {
                return done( err );
            }

            user.password = hashedPassword;
            done();
        });
    });
});

patientSchema.methods.checkPassword = function( password, done ) {
    bcrypt.compare( password, this.password, ( err, isMatch ) => {
        done( err, isMatch );
    });
};

module.exports = mongoose.model( 'patient', patientSchema );