const mongoose = require('mongoose')

const Doctor = mongoose.model( 'doctor' );
const Appointment = mongoose.model( 'appointment' )
const Patient = mongoose.model( 'patient' )


// working perfectly fine


// itreturns the array of all patients who have an appointment with a particular doctor( user )
/**
* Function that returns all patients who have an appointment with a particular doctor
* @author   Ajay
* @param    { string } doctorId    recieves in url params
* @return   {array}         array of all slots of a doctor
*/
const getPatients = async ( req, res, next ) => {
    let doctorId = res.locals.claims.id;
    // let doctorId = mongoose.Types.ObjectId("60d0d71906f4291f5c7597d7")
    console.log( doctorId )

    try {
        let patientList = await Appointment.find( { doctorId : doctorId } )

        // let patientIds = patientList.map( patient => patient.patientId);

        // let allPatients = await Patient
        //                             .find( { _id : {
        //                                     $in : patientIds
        //                             }})

        res.status( 200 ).send( patientList );
    } catch (error) {
        res.status( 500 ).send( error );
    }
}

/**
* Function that returns makes slots available of a doctor
* @author   Ajay
* @param    { string } doctorId    recieves in url params
* @return   {array}         array of all slots of a doctor
*/
const makeSlots = async ( req, res, next ) => {
    
    let slotDetails = req.body;
    const doctorId = res.locals.claims.id;
    // let doctorId = req.params.id;
    console.log( 'doctorId', doctorId);
    let newSlots  = [];
    for( let slot of slotDetails ) {
        let date = slot.date;
        date = new Date( date ).toISOString();
        slot.date = date;
        newSlots.push( slot )
    }
    console.log( 'doctorId', doctorId)
    
    try {
        let data = await Doctor.find( { _id :doctorId }, { slots : 1, _id : 0} );

        let prevSlots = data[0].slots;
        // console.log( prevSlots);
        let updatedSlots = [...prevSlots, ...newSlots ]

        await Doctor.findOneAndUpdate( { _id : doctorId }, { slots : updatedSlots }, { upsert : true } );
        let mySlots = await Doctor.find( { _id :doctorId }, { slots : 1, _id : 0} );
        res.status( 201 ).send( mySlots[0].slots )

    } catch (error) { 
        res.status( 500 ).send( "something went wrong" )
    }

}

const getSlots = async ( req, res, next ) => {
    
    let doctorId = res.locals.claims.id

    try {
        let allSlots = await Doctor.find( {_id : doctorId }).select( { slots : 1, _id : 0 } )
        res.status( 200 ).send( allSlots );
    } catch (error) {
        res.status( 500 ).send('something went wrong')
    }
}

/**
* Function that cancel the appointment
* @author   Ajay
* @param    { string } doctorId    recieves in url params
* @return   {array}         array of all slots of a doctor
*/

// cancelling an appointment means -> (i) delete the document from "appointment" collection becuase it is a kind of mapping of a doctor and a patient
    // (ii) update the slot's 'booked' to false in doctors schema
    // let { startTime, endTime, date } = req.body;

    const cancelAppointment = async ( req, res, next ) => {

        let doctorId = res.locals.claims.id;
        let  patientId= req.params.id;
        let slotId = req.query.id
    
        console.log( 'slot id', slotId)
        let appoint = {
            patientId : patientId,
            doctorId : doctorId,
            slotId : slotId
        }
        console.log( appoint);
       
        try {
                await Appointment.findOneAndDelete( appoint ); // deleting from "appointment" schema
    
                let query = { _id : mongoose.Types.ObjectId( doctorId ), "slots._id" : slotId }
                console.log( query );
                try {
                    let updatedSlot = await Doctor.updateOne( query , {
                                                                        $set : {
                                                                            "slots.$.booked" : false
                                                                        }}
                                                                    )
                    console.log( updatedSlot)
                    res.status( 201 ).send( updatedSlot )
    
                }   catch (error) {
                    console.log( error)
                    sonsole.log( 'in nested error')
                    return next( error );
            }
            } catch (err) {
                    if( err.name === 'ValidationError' ) {
                        err.status = 400;
                    } else {
                        err.status = 500;
                    }
                    console.log('error in 2nd catch', error)
    
                    return next( err );
                }
    }

module.exports = { getPatients, makeSlots, getSlots, cancelAppointment }