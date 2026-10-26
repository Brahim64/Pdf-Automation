using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Models.DTOs.Requests
{
    public class GoogleLoginRequest
    {
        public string IdToken { get; set; } = String.Empty;
    }
}