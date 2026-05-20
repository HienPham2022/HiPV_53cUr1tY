document.addEventListener('DOMContentLoaded', () => {
    const deleteCommentBtn = document.getElementById('deleteBtn');
    if (deleteCommentBtn) {
        deleteCommentBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            if (!confirm('Bạn có chắc muốn xoá tất cả bình luận không?')) return;
            try {
                const response = await fetch('/single/deleteComment', { method: 'DELETE' });
                if (!response.ok) throw new Error('Network response was not ok');
                window.location.href = '/single';
            } catch (error) {
                console.error('Error deleting comments:', error);
                alert('Xoá thất bại, vui lòng thử lại.');
            }
        });
    }

    const deleteUserBtn = document.getElementById('deleteBtnUser');
    if (deleteUserBtn) {
        deleteUserBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            if (!confirm('Bạn có chắc muốn xoá tất cả người dùng không?')) return;
            try {
                const response = await fetch('/users/deleteAllUsers', { method: 'DELETE' });
                if (!response.ok) throw new Error('Network response was not ok');
                window.location.href = '/users/login';
            } catch (error) {
                console.error('Error deleting users:', error);
                alert('Xoá thất bại, vui lòng thử lại.');
            }
        });
    }
});
