const mongoose = require( 'mongoose' );
const jwt = require( 'jsonwebtoken' );


const Patient = mongoose.model( 'patient' );


const register = async ( req, res, next ) => {
    const user = req.body;
    
    //if user is not defined
    console.log('user is ', user )
    if( !user ){
        const error = new Error( 'User details are not sent');
        next( error );
        return;
    }

    
    try {
        let updatedUser = await Patient.create( user, { password : 0} )

        if( !updatedUser ) {
            const error = new Error( 'User details are not sent');
            next( error );
            return;
        }
        res.status( 201 ).json( updatedUser );
    } catch (error) {
        if( error.name === 'ValidationError' ) {
            error.status = 400;
        } else {
            error.status = 500;
        }

        return next( error );
    }
}

const login = async ( req, res, next ) => {
    const u = req.body;

    if( !u ) {
        const error = new Error( 'Login details not sent in request body' );
        next( error );
        return;
    }
    
    if( !u.email || !u.password ) {
        const error = new Error( 'Login details not sent in request body' );
        next( error );
        return;
    }

    try {
        
        let updatedUser = await Patient.findOne( { email: u.email } )
        if( !updatedUser ) {
            const error = new Error( 'No matching credentials' );
            error.status = 404;
            return next( error );
        }
        updatedUser.checkPassword( u.password, ( err, isMatch ) => {
            if( err ) {
                const error = new Error( 'No matching credentials' );
                error.status = 404;
                return next( error );
            }

            if( !isMatch ) {
                const error = new Error( 'No matching credentials' );
                error.status = 404;
                return next( error );
            }

            // generate the token
            const claims = {
                id : updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            };

            jwt.sign( claims, 'abcd' /* process.env.JWT_SECRET */, { expiresIn: 24 * 60 * 60 }, ( err, token ) => {
                if( err ) {
                    err.status = 500;
                    return next( err );
                }

                res.json({
                    email: updatedUser.email,
                    token: token
                });
            });
        });

    } catch (err) {
        if( err.name === 'ValidationError' ) {
            err.status = 400;
        } else {
            err.status = 500;
        }

        return next( err );
    }
}


module.exports = { register , login }