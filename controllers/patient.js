const express = require( 'express' );
const mongoose = require( 'mongoose' );


const Doctor = mongoose.model( 'doctor' );
const Appointment = mongoose.model( 'appointment' )



/**
* Function that books an appointment
* @author   Ajay
* @param    {object} slot( date and time )    
* @return   {}         changes the "booked" status to "true"
*/
const bookAppointment = async ( req, res, next ) => {
    let appointmentDetails = req.body;
    let { startTime, endTime, date, doctorInfo} = appointmentDetails;
    let patientName = res.locals.claims.name;
    let patientId = res.locals.claims.id;
    let doctorId = req.params.id;
    let slotId = req.query.id

    if( !appointmentDetails) {
        const error = new Error( 'Appointment could not be made');
        next( error );
        return;
    }

    let newDate = (new Date( date ));
    console.log( newDate, startTime, endTime );
    let newAppointment = {
        startTime : startTime,
        endTime : endTime,
        date : newDate,
        patientId : patientId,
        doctorId : doctorId,
        doctorInfo : doctorInfo,
        slotId : slotId,
        patientInfo :{
            name : patientName
        }
    }

    console.log( newAppointment )

    
        try {
            let appoint = await Appointment.create( newAppointment)

            // console.log( appoint )
            let query = { _id : mongoose.Types.ObjectId( doctorId ), "slots._id" : slotId }

            try {
                let updatedSlot = await Doctor.updateOne( query , {
                                                                    $set : {
                                                                        "slots.$.booked" : true
                                                                    },
                                                                     $sort : { date : 1, "startTime.hours" : 1, "startTime.minutes" : 1} 
                                                                }
                                                                )
                console.log( updatedSlot)
                res.status( 201 ).send( updatedSlot )
                
            } catch (error) {

                return next( error );
            }
            
        } catch (err) {
            if( err.name === 'ValidationError' ) {
                err.status = 400;
            } else {
                err.status = 500;
            }

            return next( err );
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

    let patientId = res.locals.claims.id;
    let doctorId = req.params.id;
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
                return next( error );
        }
        } catch (err) {
                if( err.name === 'ValidationError' ) {
                    err.status = 400;
                } else {
                    err.status = 500;
                }
                console.log('error in 2nd catch', err)

                return next( err );
            }
}
/**
* Function that returns all appointments of a patient
* @author   Ajay
* @param    { string } doctorId    recieves in url params
* @return   {array}         array of all slots of a doctor
*/
const getAllAppointments = async ( req, res, next ) => {
    let patientId = res.locals.claims.id;

    try {
        let allAppointments = await Appointment.find( { patientId : patientId }).sort( { 'date' : 1, 'startTime.hours' : 1, 'startTime.minutes' : 1 })
        
        res.status( 200 ).send( allAppointments)
    }
    catch (error) {
            res.status( 404 ).send( 'No appointments found')
    }
                                            
}


/**
* Function that returns list of all available doctors for a patient
* @author   Ajay
* @param    { string } doctorId    recieves in url params
* @return   {array}         array of all slots of a doctor
*/

const getDoctors =  ( req, res, next ) => {

    console.log( 'error is here in the getDoctors')
    Doctor 
        .find({})
        .select( { slots : 0})
        .then( doctors => {
            console.log( doctors )
            res.send( doctors )
        })
        .catch( err => {
           console.log( 'error', err);
            res.send( err)
        })
}


/**
* Function that returns slots of a partcular doctor for a patient
* @author   Ajay
* @param    { string } doctorId    recieves in url params
* @return   {array}         array of all slots of a doctor
*/
const getSlots = async ( req, res, next ) => {
    
    let doctorId = req.params.id

    try {
        let allSlots = await Doctor.find( {_id : doctorId }).select( { slots : 1 } );
        res.status( 200 ).send( allSlots );
    } catch (error) {
        res.status( 500 ).send('something went wrong')
    }
}
module.exports = { bookAppointment, cancelAppointment, getAllAppointments, getDoctors, getSlots  }