fetch('/admin', {
    headers: {
        'Authorization': `Bearer ${token}` // Replace `token` with the actual JWT
    }
})
.then(response => {
    if (response.ok) {
        // Handle successful response, likely rendering admin.html content
    } else {
        // Handle unauthorized access, e.g., redirect to login or show error
    }
})
.catch(error => console.error('Error fetching admin page:', error));
