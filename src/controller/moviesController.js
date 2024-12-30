// src/controller/moviesController.js
import { Movie } from "../models/movieModel.js";

export async function addMovie(request, response) {
  const movie_details = request.body;

  try {
    const movie = Movie.create(movie_details);
    return response
      .status(201)
      .json({ message: "Movie added successfully.", movie: movie });
  } catch (error) {
    console.error(`Error Adding movie:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function checkUniqueMovies(request, response) {
  const { name } = request.body;

  try {
    const movie = await Movie.find({ name: name });
    if (movie.length > 0) {
      return response
        .status(409)
        .json({ message: "Movie already exists.", movie: movie });
    }
    return response.status(200).json({ message: "Unique movie title." });
  } catch (error) {
    console.error(`Error Checking unique movie:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function getAllMovies(request, response) {
  try {
    const movies = await Movie.find({});
    if (movies.length !== 0) {
      return response.status(200).json({ movies: movies });
    }
    return response.status(204).json({ message: "No movies available." });
  } catch (error) {
    console.error(`Error Fetching movies:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}
export async function getMovieByName(request, response) {
  const { name } = request.body;
  try {
    const movie = await Movie.find({ name: name });
    if (movie.length !== 0) {
      return response.status(200).json({ movie: movie });
    }
    return response.status(204).json({ message: "No movies available." });
  } catch (error) {
    console.error(`Error Fetching movies:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}
export async function getMoviesByCategory(request, response) {
  const { category } = request.body;
  try {
    const movies = await Movie.find({ category: category });
    if (movies.length !== 0) {
      return response.status(200).json({ movies: movies });
    }
    return response.status(204).json({ message: "No movies available." });
  } catch (error) {
    console.error(`Error Fetching movies:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function updateMovie(request, response) {
  const { id } = request.params;
  const updateData = request.body;

  try {
    const updatedMovie = await Movie.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedMovie) {
      return response.status(404).json({ message: "Movie not found." });
    }

    // Return the updated movie as the response
    return response.status(200).json({ movie: updatedMovie });
  } catch (error) {
    console.error(`Error updating movie: ${error.message}`);
    return response.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMovieById(request, response) {
  // const { _id } = request.body;
  console.log(request.body);
  try {
    const movie = await Movie.findById({ _id: _id });
    if (!movie) {
      return response.status(204).json({ message: "Movie not found." });
    }
    return response.status(200).json({ movie: movie });
  } catch (error) {
    console.error(`Error finding movie by id: ${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function deleteMovie(request, response) {
  const { id } = request.params;

  try {
    const deletedMovie = await Movie.findByIdAndDelete(id);

    if (!deletedMovie) {
      return response.status(404).json({ message: "Movie not found." });
    }
    return response
      .status(200)
      .json({ message: "Movie deleted successfully.", movie: deletedMovie });
  } catch (error) {
    console.error(`Error deleting movie: ${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}
