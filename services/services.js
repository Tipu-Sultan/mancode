
function isStrongPassword(password) {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhoneNumber(phoneNumber) {
    // Phone number regex for demonstration (matches 10-digit numbers)
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
}
module.exports = {
    isStrongPassword,
    isValidEmail,
    isValidPhoneNumber,

}