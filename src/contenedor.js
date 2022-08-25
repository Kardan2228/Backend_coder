const fs = require("fs");

class Contenedor {
  constructor(fileName) {
    this._filename = fileName;
    this._readFileOrCreateNewOne();
  }

  async _readFileOrCreateNewOne() {
    try {
      await fs.promises.readFile(this._filename, "utf-8");
    } catch (error) {
      error.code === "ENOENT"
        ? this._createEmptyFile()
        : console.log(
            `Código de error: ${error.code} | Hay un error inesperado al intentar leer el archivo ${this._filename}`
          );
    }
  }

  async _createEmptyFile() {
    fs.writeFile(this._filename, "[]", (error) => {
      error
        ? console.log(error)
        : console.log(`El archivo ${this._filename} fué creado con éxito`);
    });
  }

  async getById(id) {
    try {
      const data = await this.getData();
      const parsedData = JSON.parse(data);

      return parsedData.find((producto) => producto.id === id);
    } catch (error) {
      console.log(
        `Código de error: ${error.code} | Hubo un error al intentar acceder al item con id (${id})`
      );
    }
  }

  async deleteById(id) {
    try {
      const data = await this.getData();
      const parsedData = JSON.parse(data);
      const objectIdToBeRemoved = parsedData.find(
        (producto) => producto.id === id
      );

      if (objectIdToBeRemoved) {
        const index = parsedData.indexOf(objectIdToBeRemoved);
        parsedData.splice(index, 1);
        await fs.promises.writeFile(this._filename, JSON.stringify(parsedData));
      } else {
        console.log(`ID ${id} no existe en la base de datos`);
        return null;
      }
    } catch (error) {
      console.log(
        `Código de error: ${error.code} | hubo un eror al intentar eliminar el item con id (${id})`
      );
    }
  }

  async updateById(id, newData) {
    try {
      id = Number(id);
      const data = await this.getData();
      const parsedData = JSON.parse(data);
      const objectIdToBeUpdated = parsedData.find(
        (producto) => producto.id === id
      );
      if (objectIdToBeUpdated) {
        const index = parsedData.indexOf(objectIdToBeUpdated);
        const { title, price, thumbnail } = newData;

        parsedData[index]["title"] = title;
        parsedData[index]["price"] = price;
        parsedData[index]["thumbnail"] = thumbnail;
        await fs.promises.writeFile(this._filename, JSON.stringify(parsedData));
        return true;
      } else {
        console.log(`El ID ${id} no existe en la base dedatos`);
        return null;
      }
    } catch (error) {
      `Código de error: ${error.code} | Hubo un error al intentar actualizar el producto con ID: (${id})`;
    }
  }

  async save(object) {
    try {
      const allData = await this.getData();
      const parsedData = JSON.parse(allData);

      object.id = parsedData.length + 1;
      parsedData.push(object);

      await fs.promises.writeFile(this._filename, JSON.stringify(parsedData));
      return object.id;
    } catch (error) {
      console.log(
        `Código de error: ${error.code} | Hubo un eror al intentar guardar el item`
      );
    }
  }

  async deleteAll() {
    try {
      await this._createEmptyFile();
    } catch (error) {
      console.log(
        `Hay un error (${error.code}) al intentar vaciar la base de datos`
      );
    }
  }

  async getData() {
    const data = await fs.promises.readFile(this._filename, "utf-8");
    return data;
  }

  async getAll() {
    const data = await this.getData();
    return JSON.parse(data);
  }
}

module.exports = Contenedor;