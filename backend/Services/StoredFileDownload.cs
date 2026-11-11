namespace backend.Services
{
    public sealed record StoredFileDownload(Stream Stream, string FileName, string ContentType);
}
