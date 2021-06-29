const mongoose = require( 'mongoose' );
const jwt = require( 'jsonwebtoken' );

const Doctor = mongoose.model( 'doctor' );

let address = [ 'Mansarovar, Jaipur', 'Main street, Bangalore', 'Dadar, Mumbai', 'Ram nagar, jaipur', 'Chandani chowk, Delhi', 'Rajat path, Jaipur', 'Powai, Mumbai', 'Main road, Jodhpur', 'MI road, Jaipur', 'Near Rajmandir, Jaipur']
let speciality = [ 'Hair specialist', 'Child specialist', 'Dentist', 'Eye specialist', 'Physiotherapist', 'General physician', 'ENT specialist', 'General surgeon', 'General', 'Bone specialist']
const register = async ( req, res, next ) => {
    const user = req.body;

    //if user is not defined
    if( !user ){
        const error = new Error( 'User details are not sent');
        next( error );
        return;
    }
    user.clinicAddress = address[ Math.floor(Math.random()*10)];
    user.speciality = speciality[Math.floor(Math.random()*10)]
    try {
        let updatedUser = await Doctor.create( user )

        res.status( 201 ).send( updatedUser );
    } catch (err) {
        
        res.status( 500 ).send( err )
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
        let updatedUser = await Doctor.findOne( { email: u.email } )
        console.log( "updateduser",updatedUser)
        if( !updatedUser ) {
            const error = new Error( 'No matching credentials' );
            error.status = 404;
            next( error )
            return
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


module.exports = {
     register,
     login
}