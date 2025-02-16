// src/controller/moviesController.js
import slugify from "slugify";
import { Movie } from "../models/movieModel.js";
import {
  deleteImageFromCloudinary,
  processAndUploadImages,
} from "../utils/imageUtils/cloudinaryUtils.js";
import { downloadImage } from "../utils/imageUtils/imgDownloadUtils.js";
import { decodeHtmlEntities } from "../utils/urlUtils.js";

export async function addMovie(request, response) {
  const movie_details = request.body;

  try {
    const imageUrls = [
      decodeHtmlEntities(movie_details.posterURL.sm),
      decodeHtmlEntities(movie_details.posterURL.lg),
    ];
    const imageBuffers = await Promise.all(
      imageUrls.map(async (url) => {
        return await downloadImage(url);
      })
    );
    const uploadedImageUrls = await processAndUploadImages(
      imageBuffers,
      "movies/posters"
    );
    // Update the posterURL with the Cloudinary URLs
    movie_details.posterURL = {
      sm: uploadedImageUrls[0],
      lg: uploadedImageUrls[1],
    };

    // Generate a base slug
    let movie_slug = slugify(movie_details.name, { lower: true });
    let uniqueSlug = movie_slug;
    let counter = 1;

    // Add the slug and attempt to create the movie in the database
    while (true) {
      try {
        movie_details.slug = uniqueSlug;

        // Attempt to create the movie
        const movie = await Movie.create(movie_details);

        // If successful, return the response
        return response.status(201).json({
          message: "Movie added successfully.",
          movie,
        });
      } catch (error) {
        if (error.code === 11000 && error.keyPattern?.slug) {
          uniqueSlug = `${movie_slug}-${counter}`;
          counter++;
        } else {
          throw error;
        }
      }
    }
  } catch (error) {
    console.error(`Error adding movie: ${error.message}`);
    return response.status(500).json({
      message: "Internal Server Error. Check console for details",
    });
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
export async function getMovieBySlug(request, response) {
  const { slug } = request.params;
  try {
    const movie = await Movie.findOne({ slug: slug });
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

export async function getMoviesByStatus(request, response) {
  const { status } = request.params;
  try {
    const movies = await Movie.find({ status: status });
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
  const { _id } = request.body;

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
    // Find the movie to be deleted
    const deletedMovie = await Movie.findByIdAndDelete(id);

    if (!deletedMovie) {
      return response.status(404).json({ message: "Movie not found." });
    }

    // Extract image URLs from the movie's posterURL
    const { posterURL } = deletedMovie;
    const imageUrls = [
      decodeHtmlEntities(posterURL.sm),
      decodeHtmlEntities(posterURL.lg),
    ]; // Array of image URLs to delete

    // Delete images from Cloudinary
    await Promise.all(
      imageUrls.map(async (url) => {
        if (url) {
          await deleteImageFromCloudinary(url);
        }
      })
    );

    return response.status(200).json({
      message: "Movie and associated images deleted successfully.",
      movie: deletedMovie,
    });
  } catch (error) {
    console.error(`Error deleting movie: ${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function updateMoviesWithSlugs(request, response) {
  try {
    // Step 1: Fetch all movies from the database
    const movies = await Movie.find({});

    if (!movies || movies.length === 0) {
      return response
        .status(404)
        .json({ message: "No movies found in the database." });
    }

    // Step 2: Process each movie and add a unique slug field
    const updatedMovies = await Promise.all(
      movies.map(async (movie) => {
        let slug = slugify(movie.name, { lower: true }); // Generate base slug
        let uniqueSlug = slug;
        let counter = 1;

        // Attempt to save the movie with a unique slug
        while (true) {
          try {
            // Assign the slug and save the movie
            movie.slug = uniqueSlug;
            await movie.save();
            break; // Exit the loop if save succeeds
          } catch (error) {
            // Check if the error is due to a unique constraint violation
            if (error.code === 11000 && error.keyPattern?.slug) {
              // Duplicate slug detected, increment the counter and retry
              uniqueSlug = `${slug}-${counter}`;
              counter++;
            } else {
              // Rethrow other errors
              throw error;
            }
          }
        }

        return movie;
      })
    );

    // Step 3: Return the updated movies
    return response.status(200).json({
      message: "All movies have been updated with unique slugs.",
      updatedMovies,
    });
  } catch (error) {
    console.error(`Error updating movies with slugs: ${error.message}`);
    return response.status(500).json({
      message: "Internal Server Error. Check console for details.",
    });
  }
}
