const BAD_FILENAME_CHARS_RE = /[^A-Za-z0-9\-_\.]+/g;

export default function fixFilename(filename) {
    return filename.replace(BAD_FILENAME_CHARS_RE, '');
}
