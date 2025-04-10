// Get the current time
const currentTimeElement = document.getElementById('current-time');
setInterval(() => {
    const date = new Date();
    const options = {
        month: 'short',
        day: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    const currentTime = date.toLocaleString('en-US', options).replace(/,/g, '');
    const formattedTime = currentTime.toUpperCase();
    const datePart = formattedTime.substring(0, 9);
    const timePart = formattedTime.substring(9);
    currentTimeElement.innerHTML = `<span style="color: #ffffff">${datePart}</span> <span style="color: #ffffff">-</span> <span style="color: #00ffff">${timePart}</span>`;
}, 1000);


// Get the alert panel elements
const alertMessageInput = document.getElementById('alert-message');
const alertSenderInput = document.getElementById('alert-sender');
const alertToneSelect = document.getElementById('alert-tone');
const previewAlertButton = document.getElementById('preview-alert');
const triggerAlertButton = document.getElementById('trigger-alert');
const alertPreviewLed = document.getElementById('alert-preview-led');
const currentAlertDisplay = document.getElementById('current-alert');


// Define the alert panel functions
function getLedHtml(message) {
    // You need to define this function to return the HTML for the LED display
    return message;
}

function playTone(tone) {
    // You need to define this function to play the tone
}

function previewAlert() {
    const alertMessage = alertMessageInput.value;
    const ledHtml = getLedHtml(alertMessage);
    alertPreviewLed.innerHTML = ledHtml;
    startScrolling();
}


function triggerAlert() {
    const alertMessage = alertMessageInput.value;
    const alertSender = alertSenderInput.value;
    const alertTone = alertToneSelect.value;
    const correctPin = '9773';

    if (alertSender === '') {
        showPopup('Please enter your 4-digit PIN');
        return;
    }

    if (alertSender !== correctPin) {
        showPopup('<b>Invalid PIN</b>');
        return;
    }

    // Display the alert message
    const ledHtml = getLedHtml(alertMessage);
    alertPreviewLed.innerHTML = ledHtml;
    startScrolling();

    // Update the current alert display
    currentAlertDisplay.textContent = `${alertMessage}`;
    setTimeout(() => {
        currentAlertDisplay.textContent = '';
    }, 15000);

    playTone(alertTone);

    // Hide the alert message after 15 seconds
    setTimeout(() => {
        stopScrolling();
    }, 15000);
}

function showPopup(message) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(popup);
    document.body.classList.add('overlay');

    setTimeout(() => {
        document.body.classList.remove('overlay');
        popup.remove();
    }, 2000);
}



let scrollInterval;


function startScrolling() {
    let scrollPosition = 0;
    scrollInterval = setInterval(function() {
        scrollPosition--;
        alertPreviewLed.scrollLeft = scrollPosition;
        if (scrollPosition <= -alertPreviewLed.scrollWidth) {
            scrollPosition = 0;
        }
    }, 50);
}


function stopScrolling() {
    clearInterval(scrollInterval);
}



// Add event listeners to the alert panel buttons
previewAlertButton.addEventListener('click', previewAlert);
triggerAlertButton.addEventListener('click', () => {
    triggerAlert();
    alertMessageInput.value = '';
    alertSenderInput.value = '';
    alertPreviewLed.innerHTML = '';
});

const emergencyAlertButton = document.getElementById('emergency-alert');
const resetConsoleButton = document.getElementById('reset-console'); // assuming you have a reset console button

function emergencyAlert() {
    const header = document.querySelector('.header');
    let count = 0;

    // Grey out the preview alert and trigger alert buttons
    previewAlertButton.disabled = true;
    previewAlertButton.style.opacity = '0.5';
    triggerAlertButton.disabled = true;
    triggerAlertButton.style.opacity = '0.5';

    // Grey out the name, message, and tone fields
    alertMessageInput.disabled = true;
    alertMessageInput.style.opacity = '0.5';
    alertSenderInput.disabled = true;
    alertSenderInput.style.opacity = '0.5';
    alertToneSelect.disabled = true;
    alertToneSelect.style.opacity = '0.5';

    const intervalId = setInterval(() => {
        if (count % 2 === 0) {
            emergencyAlertButton.style.backgroundColor = '#ff0000'; // red
            emergencyAlertButton.style.color = '#ffff00'; // orange
            header.style.backgroundColor = '#333'; // original color
        } else {
            emergencyAlertButton.style.backgroundColor = '#ffff00'; // orange
            emergencyAlertButton.style.color = '#ff0000'; // red
            header.style.backgroundColor = '#ff0000'; // red
        }
        count++;
        if (count >= 20) { // 20 intervals = 10 seconds
            clearInterval(intervalId);
            emergencyAlertButton.classList.add('post-flash');
            header.style.backgroundColor = '#ff0000'; // solid red
            document.getElementById('reset-console').classList.add('enabled'); // Add this line
            currentAlertDisplay.style.color = '#ffa07a'; // orange
            currentAlertDisplay.textContent = '- EMERGENCY ALERT -';
        }
    }, 500); // 500ms = 0.5 seconds
}

function resetConsole() {
    emergencyAlertButton.style = ''; /* reset to original styles */
    emergencyAlertButton.classList.remove('post-flash');
    document.querySelector('.header').style.backgroundColor = ''; /* reset to original styles */
    document.getElementById('reset-console').classList.remove('enabled');
    document.getElementById('reset-console').style.opacity = '0.5'; /* greyed out */
    alertPreviewLed.innerHTML = ''; /* reset the alert preview LED */
    currentAlertDisplay.textContent = ''; /* reset the current alert display */

    // Re-enable the preview alert and trigger alert buttons
    previewAlertButton.disabled = false;
    previewAlertButton.style.opacity = '1';
    triggerAlertButton.disabled = false;
    triggerAlertButton.style.opacity = '1';

    // Re-enable the name, message, and tone fields
    alertMessageInput.disabled = false;
    alertMessageInput.style.opacity = '1';
    alertSenderInput.disabled = false;
    alertSenderInput.style.opacity = '1';
    alertToneSelect.disabled = false;
    alertToneSelect.style.opacity = '1';
}

emergencyAlertButton.addEventListener('click', emergencyAlert);
resetConsoleButton.addEventListener('click', resetConsole);

const gearIcon = document.getElementById('gear-icon');
let alertHistory = [];
let isLockedOut = false;
let lockoutTime = 0;

gearIcon.addEventListener('click', () => {
    if (isLockedOut) {
        const currentTime = new Date().getTime();
        if (currentTime - lockoutTime < 60000) {
            const timeRemaining = Math.floor((60000 - (currentTime - lockoutTime)) / 1000);
            const errorMessage = `
                <div id="error-message" class="popup">
                    <div class="popup-content">
                        <h2>Error</h2>
                        <p>You are locked out for ${timeRemaining} seconds.</p>
                    </div>
                </div>
            `;
            const errorPopup = document.createElement('div');
            errorPopup.innerHTML = errorMessage;
            document.body.appendChild(errorPopup);
            setTimeout(() => {
                errorPopup.remove();
            }, 3000);
            return;
        } else {
            isLockedOut = false;
        }
    }

    const correctPin = '9773';

    // Create the PIN popup content
    const pinPopupContent = `
        <div id="pin-popup" class="popup">
            <div class="popup-content">
                <h2>Enter PIN</h2>
                <input type="text" id="pin-input" maxlength="4" required>
                <button id="submit-pin-btn">Submit</button>
            </div>
        </div>
    `;

    // Add the PIN popup content to the page
    const pinPopup = document.createElement('div');
    pinPopup.innerHTML = pinPopupContent;
    document.body.appendChild(pinPopup);

    // Add event listener to the submit PIN button
    const submitPinBtn = document.getElementById('submit-pin-btn');
    submitPinBtn.addEventListener('click', () => {
        const enteredPin = document.getElementById('pin-input').value;
        if (enteredPin === correctPin) {
            // Remove the PIN popup
            pinPopup.remove();

            // Create the admin page content
            const adminPageContent = `
                <div id="admin-page">
                    <h1>Admin Page</h1>
                    <h2>Settings</h2>
                    <form id="admin-form">
                        <label for="pin">Change PIN:</label>
                        <input type="text" id="pin" name="pin" maxlength="4" required>
                        <button id="change-pin-btn">Change PIN</button>
                    </form>
                    <h2>Alert History</h2>
                    <div id="alert-history">
                        ${alertHistory.map((alert, index) => `<p>Alert ${index + 1}: ${alert}</p>`).join('')}
                    </div>
                    <h2>System Information</h2>
                    <div id="system-info">
                        <!-- System information will be displayed here -->
                    </div>
                    <button id="back-to-main-btn">Back to Main</button>
                </div>
            `;

            // Replace the main content with the admin page content
            const mainContent = document.querySelector('.container');
            mainContent.innerHTML = adminPageContent;

            // Add event listener to the back to main button
            const backToMainBtn = document.getElementById('back-to-main-btn');
            backToMainBtn.addEventListener('click', () => {
                // Restore the original main content
                window.location.reload();
            });

            // Add event listener to the change PIN button
            const changePinBtn = document.getElementById('change-pin-btn');
            changePinBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const newPin = document.getElementById('pin').value;
                // Code to change the PIN goes here
            });
        } else {
            // Lock the user out for 1 minute
            isLockedOut = true;
            lockoutTime = new Date().getTime();
            const errorMessage = `
                <div id="error-message" class="popup">
                    <div class="popup-content">
                        <h2>Error</h2>
                        <p>You have entered the wrong PIN. You are locked out for 1 minute.</p>
                    </div>
                </div>
            `;
            const errorPopup = document.createElement('div');
            errorPopup.innerHTML = errorMessage;
            document.body.appendChild(errorPopup);
            setTimeout(() => {
                errorPopup.remove();
            }, 3000);
            pinPopup.remove();
        }
    });
});

// Add event listener to the trigger alert button
const triggerAlertBtn = document.getElementById('trigger-alert');
triggerAlertBtn



function showPinPopup() {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <div class="popup-content">
            <h2>Enter PIN</h2>
            <input type="password" id="pin-input" maxlength="4" required>
            <button id="submit-pin-btn">Submit</button>
        </div>
    `;
    document.body.appendChild(popup);
    document.body.classList.add('overlay');
    document.querySelector('.container').style.display = 'none'; // Hide the container

    const submitPinBtn = document.getElementById('submit-pin-btn');
    submitPinBtn.addEventListener('click', () => {
        const enteredPin = document.getElementById('pin-input').value;
        const correctPin = '9773';
        if (enteredPin === correctPin) {
            popup.remove();
            document.body.classList.remove('overlay');
            document.querySelector('.container').style.display = 'block'; // Show the container
            showBetaPopup();
        } else {
            alert('Incorrect PIN. Please try again.');
        }
    });
}

function showBetaPopup() {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <div class="popup-content">
            <h2>Beta Version</h2>
            <p>This program is currently in beta stages and is not intended for production use.</p>
            <button id="beta-popup-ok-btn">OK</button>
        </div>
    `;
    document.body.appendChild(popup);
    document.body.classList.add('overlay');

    const okButton = document.getElementById('beta-popup-ok-btn');
    okButton.addEventListener('click', () => {
        popup.remove();
        document.body.classList.remove('overlay');
    });
}

showPinPopup();