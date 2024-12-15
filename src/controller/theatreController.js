import { Theatre } from "../models/theatresModel.js";

export async function addTheatre(request, response) {
  const  Theatre_details  = request.body;
    
  try {
    const Theatre = await Theatre.create(Theatre_details);
    return response.status(201).json({
      message: "Theatre added successfully.",
      Theatre: Theatre,
    });
  } catch (error) {
    console.error(`Error Adding Theatre:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function checkUniqueTheatres(request, response) {
  const { name } = request.body;

  try {
    const Theatre = await Theatre.find({ name: name });
    if (Theatre.length > 0) {
      return response.status(409).json({
        message: "Theatre already exists.",
        Theatre: Theatre,
      });
    }
    return response.status(200).json({ message: "Unique Theatre." });
  } catch (error) {
    console.error(`Error Checking unique Theatre:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function getAllTheatres(request, response) {
  try {
    const Theatres = await Theatre.find({});
    if (Theatres.length !== 0) {
      return response.status(200).json({ Theatres: Theatres });
    }
    return response.status(204).json({ message: "No Theatres available." });
  } catch (error) {
    console.error(`Error Fetching All Theatres:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}
export async function getTheatreByName(request, response) {
  const { name } = request.body;
  try {
    const Theatre = await Theatre.find({ name: name });
    if (Theatre.length !== 0) {
      return response.status(200).json({ Theatre: Theatre });
    }
    return response
      .status(204)
      .json({ message: "No Theatre available by this name." });
  } catch (error) {
    console.error(`Error Fetching Theatres:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}
export async function getTheatresByLocation(request, response) {
  const { location } = request.body;
  try {
    const Theatres = await Theatre.find({ location: location });
    if (Theatres.length !== 0) {
      return response.status(200).json({ Theatres: Theatres });
    }
    return response
      .status(204)
      .json({ message: "No Theatre available for this location." });
  } catch (error) {
    console.error(`Error Fetching Theatres:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}
export async function getTheatresbyStatus(request, response) {
  const { isActive } = request.params;
  try {
    const Theatres = await Theatre.find({ isActive: isActive });
    if (Theatres.length !== 0) {
      return response.status(200).json({ Theatres: Theatres });
    }
    return response
      .status(204)
      .json({ message: "No Theatre available for this location." });
  } catch (error) {
    console.error(`Error Fetching Theatres:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function updateTheatre(request, response) {
  const { id } = request.params;
  const updateData = request.body;

  try {
    const updatedTheatre = await Theatre.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedTheatre) {
      return response.status(404).json({ message: "Theatre not found." });
    }

    return response.status(200).json({ Theatre: updatedTheatre });
  } catch (error) {
    console.error(`Error updating Theatre: ${error.message}`);
    return response.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteTheatre(request, response) {
  const { id } = request.params;

  try {
    const deletedTheatre = await Theatre.findByIdAndDelete(id);

    if (!deletedTheatre) {
      return response.status(404).json({ message: "Theatre not found." });
    }
    return response.status(200).json({
      message: "Theatre deleted successfully.",
      Theatre: deletedTheatre,
    });
  } catch (error) {
    console.error(`Error deleting Theatre: ${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}
