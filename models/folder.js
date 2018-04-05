'use strict';

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String},
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
// compound index
folderSchema.index({ name: 1, userId: 1}, { unique: true });

folderSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});


//cascade null
folderSchema.pre('remove', function(next) {
  mongoose.models.Note.updateMany(
    { folderId: this._id, userId: this.userId },
    { '$unset': { 'folderId': '' } }
  )
    .then(() => next())
    .catch(err => {
      next(err);
    });
});

//cascade delete
// folderSchema.pre('remove', function(next) {
//   mongoose.models.Note.remove({folderId: this._id})
//     .then(() => next())
//     .catch(err => {
//       next(err);
//     });
// });


module.exports = mongoose.model('Folder', folderSchema);
