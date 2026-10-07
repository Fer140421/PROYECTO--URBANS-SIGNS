import 'package:image_picker/image_picker.dart';

class ImageService {
  ImageService({ImagePicker? picker}) : _picker = picker ?? ImagePicker();

  final ImagePicker _picker;

  Future<XFile?> pickCamera() => _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 82,
        maxWidth: 1800,
      );

  Future<XFile?> pickGallery() => _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 82,
        maxWidth: 1800,
      );
}
