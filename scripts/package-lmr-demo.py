"""Create the dashboard upload ZIP with portable, forward-slash paths."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parent.parent
source = root / '.qa' / 'cloudflare' / 'lmr-demo'
archive = source.parent / 'lmr-demo.zip'
if not (source / 'index.html').is_file() or not (source / '_headers').is_file():
    raise SystemExit('Primero ejecutar npm run build:lmr-demo.')

with ZipFile(archive, 'w', compression=ZIP_DEFLATED) as target:
    for file in sorted(source.rglob('*')):
        if file.is_file():
            target.write(file, file.relative_to(source).as_posix())

with ZipFile(archive) as target:
    if target.testzip() or any('\\' in file.filename for file in target.infolist()):
        raise SystemExit('El paquete no superó la validación de integridad/rutas.')
    print(f'{len(target.infolist())} archivos · {archive.stat().st_size} bytes · {archive}')
