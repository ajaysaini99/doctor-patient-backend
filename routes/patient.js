const express = require( 'express' );

const router = express.Router();


const { register, login } = require( '../controllers/authPatient' )
const { bookAppointment, cancelAppointment, getAllAppointments, getDoctors, getSlots  } = require( '../controllers/patient' );
const { authenticate } = require( '../middleware/auth' )

router.post( '/register', register );
router.post( '/login', login );

router.post( '/:id', authenticate, bookAppointment );
router.patch( '/:id', authenticate, cancelAppointment );
router.get( '/appointments', authenticate, getAllAppointments );
router.get( '/doctors', authenticate, getDoctors )
router.get( '/:id', authenticate, getSlots );




// router.patch( '/:id', bookAppointment)


module.exports = router