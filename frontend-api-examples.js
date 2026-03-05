const API_BASE_URL = "https://your-render-app.onrender.com/api";

async function addTeamExample() {
  const payload = {
    name: "Metro Hawks",
    logo: "https://example.com/logos/hawks.png",
    wins: 10,
    losses: 2,
    points: 22,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to add team");
    }

    const data = await response.json();
    await Swal.fire({
      icon: "success",
      title: "Team Added",
      text: `${data.name} was saved successfully.`,
    });
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Add Failed",
      text: error.message,
    });
  }
}

async function updatePlayerExample(playerId) {
  const payload = {
    points: 32,
    rebounds: 9,
    assists: 11,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to update player");
    }

    const data = await response.json();
    await Swal.fire({
      icon: "success",
      title: "Player Updated",
      text: `${data.playerName} was updated successfully.`,
    });
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: error.message,
    });
  }
}

async function deleteScheduleExample(scheduleId) {
  const confirmation = await Swal.fire({
    title: "Delete game schedule?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
  });

  if (!confirmation.isConfirmed) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/schedule/${scheduleId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete schedule");
    }

    await Swal.fire({
      icon: "success",
      title: "Deleted",
      text: "Schedule item deleted successfully.",
    });
  } catch (error) {
    await Swal.fire({
      icon: "error",
      title: "Delete Failed",
      text: error.message,
    });
  }
}
