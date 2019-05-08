import Note from './noteModel';


export const getNotes = () => {
  return Note.find({}).then((notes) => {
    return notes.reduce((result, item) => {
      result[item.id] = item;
      return result;
    }, {});
  });
};

export const deleteNote = (id) => {
  Note.findOneAndDelete(id).then((result) => {
    return true;
  })
    .catch((error) => {
      return (error);
    });
};

export function createNote(fields) {
  const note = new Note({
    text: fields.text,
    title: fields.title,
    x: fields.x,
    y: fields.y,
  });
  return note.save();
}

export const updateNote = (id, fields) => {
  return Note.findById(id)
    .then((note) => {
      Object.keys(fields).forEach((k) => {
        note[k] = fields[k];
      });
      return note.save();
    });
};
