import { ProductModel } from "../daos/mongodb/models/products.model.js";

export class ProductRepository {
    async agregarProducto({ title, description, code, price, stock, category, thumbnails, owner }) {
        try {
            if (!title || !description || !code || !price || !stock || !category) {
                console.log("Todos los campos son obligatorios");
                return;
            }
            const existeProducto = await ProductModel.findOne({ code: code });
            if (existeProducto) {
                throw new Error(Errors.PRODUCTO_EXISTE);
            }
            const newProduct = new ProductModel({
                title,
                description,
                code,
                price,
                status: true,
                stock,
                category,
                thumbnails: thumbnails || [],
                owner
            });
            await newProduct.save();
            return newProduct;
        } catch (error) {
            console.log("fallo", error);
        }
    }

    async obtenerProductos({limit = 100, page = 1, sort, query} = {}) {
        try {
            const skip = (page - 1) * limit;
            let queryOptions = {};
            if (query) {
                queryOptions = { category: query };
            }
            const sortOptions = {};
            if (sort) {
                if (sort === 'asc' || sort === 'desc') {
                    sortOptions.price = sort === 'asc' ? 1 : -1;
                }
            }
            const productos = await ProductModel
                .find(queryOptions)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit);
            const totalProducts = await ProductModel.countDocuments(queryOptions);     
            const totalPages = Math.ceil(totalProducts / limit);      
            const hasPrevPage = page > 1;
            const hasNextPage = page < totalPages;
            return {
                docs: productos,
                totalPages,
                prevPage: hasPrevPage ? page - 1 : null,
                nextPage: hasNextPage ? page + 1 : null,
                page,
                hasPrevPage,
                hasNextPage,
                prevLink: hasPrevPage ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort}&query=${query}` : null,
                nextLink: hasNextPage ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort}&query=${query}` : null,
            };
        } catch (error) {
            console.log("Error 1", error)
        }
    }

    async obtenerProductoPorId(id) {
        try {
            const products = await ProductModel.findById(id);

            if (!products) {
                console.log("Error 2", error)
            }
            console.log("Producto encontrado!!");
            return products;
        } catch (error) {
            console.log("Error 3", error)
        }
    }

    async actualizarProducto(id, productoActualizado) {
        try {
            const actualizado = await ProductModel.findByIdAndUpdate(id, productoActualizado);
            if (!actualizado) {
                console.log("Error 4", error);
            }
            console.log("Producto actualizado con éxito");
            return actualizado;
        } catch (error) {
            console.log("Error 5", error)
        }
    }

    async eliminarProducto(id) {
        try {
            const deleteado = await ProductModel.findByIdAndDelete(id);
            if (!deleteado) {
                console.log("Error 6", error)
            }
            console.log("Producto eliminado correctamente!");
            return deleteado;
        } catch (error) {
            console.log("Error 7", error)
        }
    }
}

