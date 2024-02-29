document.addEventListener("DOMContentLoaded", function() {
    var deleteBtn = document.getElementById("deleteBtn");

    deleteBtn.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the default action of the link
        // Send DELETE request when the button is clicked
        fetch('/single/deleteComment', {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Handle successful response
            console.log('Comment deleted successfully');
        })
        .catch(error => {
            // Handle errors if any
            console.error('There was a problem with the fetch operation:', error);
        });
    });
});
